# Seeking an “Effective Loss” for Grokking in Modular Addition  
*(A case study in Fourier features, phase alignment, and what can go wrong with “global phases”)*

## TL;DR  

I read the very recent "On the Mechanism and Dynamics of Modular Addition: Fourier Features, Lottery Ticket, and Grokking" paper, and developped some ideas. I am not trying to propose/refine the grokking theory, but am testing whether a checkpoint-level mechanistic score can be defined in a way that is **measurement-valid**, **coordinate-aware**, and **less confounded by pure scale growth**, so that we can meaningfully ask whether phase-alignment structure tracks generalization.

Concretely, this case study does four things on real checkpoints:
1. Builds candidate alignment scores (global-phase and neuronwise) from Fourier coefficients.
2. Stress-tests coordinate assumptions (decoded vs raw pairing).
3. Tests whether global phase is trustworthy when coherence is low.
4. Compares alignment scores against real test accuracy while controlling for magnitude/norm baselines.

**Key takeaways from this run (p=23, width=512, ReLU, random data, weight decay=2.0):**
- Using sampled checkpoints, I define \(t_\text{grok}\) as the first checkpoint where test accuracy reaches 95%, and find **t_grok = 11000**.
- A **global phase-based alignment** score can be **actively misleading** under low coherence; I show an explicit counterexample.
- A **neuronwise, magnitude-weighted alignment** score is more robust as a measurement, but its raw correlation with test accuracy is strongly entangled with norm/magnitude growth.
- In this run, **global coherence does not increase at grokking**; energy-weighted coherence decreases.

This post is written for general ML readers, no prior familiarity with modular-addition grokking is assumed.

---

## 1. Background: modular addition and grokking  
### Modular addition toy task  
Fix a prime modulus \(p\) (here \(p=23\)). Inputs are pairs \((a,b)\) and the target is:
\[
y = (a+b) \bmod p.
\]
I train a small MLP classifier to predict \(y\).

### Grokking (in this setting)  
“Grokking” refers to the phenomenon where:
- **training accuracy becomes perfect early**, but  
- **test accuracy remains poor for a long time**, then  
- **test accuracy suddenly rises** to near-perfect later.

For this case study (with sampled checkpoints), I use:
\[
t_\text{grok} = \min\{t: \text{test\_accuracy}(t) \ge 0.95\}.
\]
That is: the first sampled checkpoint where test accuracy crosses 95%.

---

## 2. What the original “Mechanism and Dynamics” work claims (informal)  
The blog’s central mechanistic narrative (in broad strokes) is:

1) The network learns a **Fourier-feature representation** for modular addition.  
2) Individual Fourier frequencies compete; training plus weight decay leads to a kind of “lottery ticket” selection where some frequency structure dominates.  
3) A key ingredient is **phase alignment** between “input-side” and “output-side” Fourier features (often summarized by a mismatch variable like \(D=2\phi-\psi\)).  
4) Grokking corresponds to a transition where these structured features dominate generalization.

This raises a natural “effective theory” question (in the spirit of Liu et al., *Towards Understanding Grokking: An Effective Theory of Representation Learning*):
> Can I define a low-dimensional *effective loss / score* on weights that captures this competition and tracks generalization?

---

## 3. Our question and why the earlier attempt went off the rails  
A naive attempt might define a “lottery score”
\[
\ell_\text{lottery} = \sum_k \alpha_k^2\,\beta_k^2\,\cos(D_k),
\]
where \(\alpha_k, \beta_k\) are magnitudes of frequency \(k\) at input/output and \(D_k\) is a phase mismatch.

But there’s a subtle issue:

> In a width-\(m\) network, each frequency \(k\) has **m different phases** (one per neuron).  
> Collapsing them into *one global phase* can be meaningless if those phases cancel out.

The old notebook effectively assumed the global phase was always meaningful, then layered additional dynamics (ODE/Jacobian/bifurcation) on top. This can produce confident-looking but incorrect “mechanistic conclusions.”

So the goal here is **much simpler and more rigorous**:
- use real checkpoints,
- define variables directly from weights,
- validate accuracy reconstruction,
- and explicitly test whether “global phase” is reliable.

---

## 4. What I actually do (checkpoint-grounded pipeline)  

### 4.1 Load checkpoints and validate evaluation  
I analyze the run folder:
- `src/saved_models/p_23_dmlp_512_ReLU_random_scale_0.1_decay_2.0_08180102/`
with many checkpoints from `0.pth` to `49800.pth` plus `final.pth`.

I recompute accuracy from `train_data.pth` and `test_data.pth` using the model forward, and validate against stored accuracies (when present):

|   epoch |   stored_train_accuracy |   computed_train_accuracy |   stored_test_accuracy |   computed_test_accuracy |   train_abs_diff |   test_abs_diff |
|--------:|------------------------:|--------------------------:|-----------------------:|-------------------------:|-----------------:|----------------:|
|       0 |               0.0378788 |                 0.0378788 |              0.0601504 |                0.0601504 |      1.12888e-09 |     1.51252e-09 |
|   11000 |               1         |                 1         |              0.962406  |                0.962406  |      0           |     2.42004e-08 |

This is the “am I measuring the real model?” gate. If this fails, nothing else matters.

---

## 5. Fourier features: turning weights into per-frequency complex coefficients  
Because \(p=23\) uses a real Fourier basis with DC + cosine/sine pairs, each frequency \(k\in\{1,\dots,(p-1)/2\}\) corresponds to indices:
- \(i_\cos=2k-1\)
- \(i_\sin=2k\)

Let hidden width be \(m\) (here \(m=512\)). For each neuron \(j\) and frequency \(k\), define complex coefficients:

**Input-side (from \(W_\text{in}\in\mathbb{R}^{m\times p}\))**
\[
A_{j,k} = W_\text{in}[j,i_\cos] + i\,W_\text{in}[j,i_\sin].
\]

**Output-side (from \(W_\text{out}\in\mathbb{R}^{p\times m}\))**
\[
B_{j,k} = W_\text{out}[i_\cos,j] + i\,W_\text{out}[i_\sin,j].
\]

Then magnitude summaries:
\[
\alpha_k = \sqrt{\mathbb{E}_j |A_{j,k}|^2},\qquad
\beta_k = \sqrt{\mathbb{E}_j |B_{j,k}|^2}.
\]

In the codebase, there is an additional subtlety: the model stores a Fourier basis matrix, and the “mechanism” utilities use a **decoded** coordinate system via a basis transform. I therefore compare **raw pairing vs decoded pairing** and find they can differ drastically:

| metric                   |   pearson(decoded,raw) |   mean_abs_ratio(decoded/raw) |
|:-------------------------|-----------------------:|------------------------------:|
| ell_neuron               |              -0.993721 |                     41.0147   |
| top1_out                 |              -0.864142 |                      1.03804  |
| ell_neuron_norm          |              -0.607647 |                     41.3432   |
| ell_global               |               0.131883 |                      2.62712  |
| coherence_joint_weighted |               0.978196 |                      0.924846 |
| sum_alpha2beta2          |               0.999991 |                      1.09141  |

![decoded vs raw](./001_matplotlib.png)

**Interpretation:** you must get the coordinate system right, or you can invert the sign/meaning of your mechanistic scores.

For reference, decoded vs raw per-frequency magnitudes at one epoch:

|   k |   alpha_decoded |   beta_decoded |   alpha_raw |   beta_raw |
|----:|----------------:|---------------:|------------:|-----------:|
|   1 |        0.438788 |       0.475687 |    0.421154 |   0.468041 |
|   2 |        0.434632 |       0.469976 |    0.421162 |   0.459401 |
|   3 |        0.454894 |       0.488653 |    0.420134 |   0.461778 |
|   4 |        0.434974 |       0.473973 |    0.42238  |   0.451873 |
|   5 |        0.40966  |       0.443738 |    0.43655  |   0.463319 |

---

## 6. Global phases vs neuronwise alignment  
This is the conceptual core.

### 6.1 What does “phase coherence” mean?  
Each \(A_{j,k}\) has a phase \(\theta_{j,k} = \arg(A_{j,k})\).  
If phases cluster, they are **coherent**. If phases spread around the circle, they are **incoherent** and cancel.

A standard concentration metric is:
\[
C_k^\text{in} = \frac{\left|\sum_j A_{j,k}\right|}{\sum_j |A_{j,k}| + \varepsilon}\in[0,1].
\]
Similarly \(C_k^\text{out}\) with \(B\).

- \(C\approx 1\): phases align (coherent)  
- \(C\approx 0\): phases disperse (incoherent; heavy cancellation)

Heatmaps over time:

![phase concentration](./004_matplotlib.png)

### 6.2 Global phase-based alignment (fragile)  
Global-phase alignment collapses all neurons into one phasor:
\[
\bar A_k = \sum_j A_{j,k},\quad \bar B_k = \sum_j B_{j,k}
\]
and defines phases:
\[
\phi_k = \arg(\bar A_k),\quad \psi_k=\arg(\bar B_k),\quad
D_k^\text{global}=2\phi_k-\psi_k.
\]
Then a score like:
\[
\ell_\text{global}=\sum_k \alpha_k^2\beta_k^2\cos(D_k^\text{global}).
\]

This is only meaningful when \(C_k\) is not tiny.

### 6.3 Neuronwise weighted alignment (robust)  
Instead, compute mismatch per neuron:
\[
D_{j,k} = 2\arg(A_{j,k}) - \arg(B_{j,k}).
\]
weight by “how much this neuron-frequency matters”:
\[
w_{j,k}=|A_{j,k}|^2|B_{j,k}|^2.
\]
Define a robust alignment score:
\[
\ell_\text{neuron} = \sum_k\sum_j w_{j,k}\cos(D_{j,k}).
\]
And a scale-controlled version:
\[
\ell_{\text{neuron\_norm}} = \frac{\sum_k\sum_j w_{j,k}\cos(D_{j,k})}{\sum_k\sum_j w_{j,k}+\varepsilon}\in[-1,1].
\]

### 6.4 A concrete failure mode: why global phase can “lie”  
At low coherence, \(\bar A_k\) can be near zero and its angle is extremely sensitive. The notebook exhibits a checkpoint where:
- coherence is low,
- \(\cos(D_k^\text{global})\) looks strongly aligned,
- but neuronwise weighted alignment is not.

The diagnostic plots:

![failure mode plot](./007_matplotlib.png)

This is the main methodological point: **global phase is not a safe effective variable without a coherence check.**

---

## 7. Results: grokking, magnitudes, and mechanistic scores  

### 7.1 Grokking time and learning curves  
In this run, I find:
- \(t_\text{grok}=11000\)

Accuracy and loss:

![accuracy and loss](./002_matplotlib.png)

### 7.2 Frequency magnitudes over time  
Per-frequency RMS magnitudes:

![magnitudes heatmap](./005_matplotlib.png)

### 7.3 Mechanistic scores over time  
Raw scores (scale-sensitive) and normalized scores (scale-controlled):

![scores over time](./003_matplotlib.png)

### 7.4 Scatter views (intuition)  
Scatter of test accuracy vs various scores:

![scatter plots](./006_matplotlib.png)

---

## 8. Correlations and confound-control  
A naive reading might say “\(\ell_\text{neuron}\) predicts test accuracy,” but note that many scale-like quantities correlate too (e.g. parameter norm, \(\sum_k\alpha_k^2\beta_k^2\)). The notebook therefore reports both Pearson and Spearman correlations.

**Sorted by Pearson (top rows shown):**
| metric                   |   pearson_corr_with_test_accuracy |   spearman_corr_with_test_accuracy |
|:-------------------------|----------------------------------:|-----------------------------------:|
| param_norm               |                          0.972717 |                          0.34997   |
| ell_neuron               |                          0.914992 |                          0.34997   |
| ell_abs                  |                          0.914992 |                          0.34997   |
| sum_alpha2beta2          |                          0.914219 |                          0.34997   |
| top1_out                 |                          0.884516 |                          0.0359523 |
| top1_in                  |                          0.606499 |                          0.212823  |
| ell_abs_norm             |                          0.472201 |                          0.859671  |
| ell_neuron_norm          |                          0.467164 |                          0.859671  |
| ell_global               |                         -0.189675 |                         -0.617517  |
| H_in                     |                         -0.315959 |                          0.41593   |
| ell_global_norm          |                         -0.440388 |                         -0.686782  |
| H_out                    |                         -0.800971 |                          0.0629806 |
| coherence_in_weighted    |                         -0.80666  |                         -0.856654  |
| coherence_out_weighted   |                         -0.882354 |                         -0.809137  |
| coherence_joint_weighted |                         -0.920891 |                         -0.860928  |
| coherence_mean           |                         -0.922793 |                         -0.860928  |

**Sorted by Spearman (top rows shown):**
| metric                   |   pearson_corr_with_test_accuracy |   spearman_corr_with_test_accuracy |
|:-------------------------|----------------------------------:|-----------------------------------:|
| ell_neuron_norm          |                          0.467164 |                          0.859671  |
| ell_abs_norm             |                          0.472201 |                          0.859671  |
| H_in                     |                         -0.315959 |                          0.41593   |
| ell_neuron               |                          0.914992 |                          0.34997   |
| sum_alpha2beta2          |                          0.914219 |                          0.34997   |
| ell_abs                  |                          0.914992 |                          0.34997   |
| param_norm               |                          0.972717 |                          0.34997   |
| top1_in                  |                          0.606499 |                          0.212823  |
| H_out                    |                         -0.800971 |                          0.0629806 |
| top1_out                 |                          0.884516 |                          0.0359523 |
| ell_global               |                         -0.189675 |                         -0.617517  |
| ell_global_norm          |                         -0.440388 |                         -0.686782  |
| coherence_out_weighted   |                         -0.882354 |                         -0.809137  |
| coherence_in_weighted    |                         -0.80666  |                         -0.856654  |
| coherence_mean           |                         -0.922793 |                         -0.860928  |
| coherence_joint_weighted |                         -0.920891 |                         -0.860928  |

I also do a small confound-control regression: baseline predictors are magnitude-like terms, and I test whether adding the alignment-only score improves fit.

| model                      |   n |       r2 |   coef[sum_alpha2beta2] |   coef[top1_out] |   coef[param_norm] |   coef[ell_neuron_norm] |   coef[ell_abs_norm] |
|:---------------------------|----:|---------:|------------------------:|-----------------:|-------------------:|------------------------:|---------------------:|
| baseline                   |  55 | 0.962483 |               -0.140428 |        -0.119759 |           0.538763 |             nan         |          nan         |
| baseline + ell_neuron_norm |  55 | 0.973845 |               -0.198463 |        -0.140994 |           0.635978 |              -0.0413182 |          nan         |
| baseline + ell_abs_norm    |  55 | 0.973912 |               -0.199108 |        -0.141227 |           0.637189 |             nan         |           -0.0416447 |

The incremental improvement is small (ΔR² ~ 0.01), and the alignment coefficient is not strongly positive here. The honest interpretation is:

> In this run, the strong raw correlation of \(\ell_\text{neuron}\) with test accuracy is heavily entangled with scale/magnitude growth.  
> The alignment-only component behaves differently and cannot yet be claimed as *the* driver.

---

## 9. Frequency “competition” diagnostics  
I also look at frequency entropy and top-frequency mass:

![entropy and top-mass](./008_matplotlib.png)

(Here the curves are fairly flat after the grokking boundary; this run does not show dramatic single-frequency takeover in these particular summary statistics.)

---

## 10. What this case study tells us

### What it **proves / establishes**
1) **A trustworthy measurement layer:** I can extract Fourier magnitudes and phase statistics from real checkpoints and reproduce stored accuracies.  
2) **Global-phase alignment is not generally valid:** without coherence, global \(D_k\) can be arbitrarily misleading (explicit counterexample shown).  
3) **Neuronwise alignment is a robust effective observable:** it behaves sensibly even when global phases cancel.

### What it **suggests** (but does not prove causally)
- Some low-dimensional scalar(s) strongly track generalization in this run (raw \(\ell_\text{neuron}\), \(\sum\alpha^2\beta^2\), parameter norm).  
- Alignment-only metrics may be monotonic in a rank sense (high Spearman), but their causal role is not established.

---

## 11. Summary table for this run  
| run_name                                               |   t_grok |   corr(ell_neuron,test_acc) |   corr(ell_neuron_norm,test_acc) |   corr(ell_global,test_acc) |   coh_weighted_pre_grok |   coh_weighted_post_grok |   ell_neuron_at_t_grok |
|:-------------------------------------------------------|---------:|----------------------------:|---------------------------------:|----------------------------:|------------------------:|-------------------------:|-----------------------:|
| p_23_dmlp_512_ReLU_random_scale_0.1_decay_2.0_08180102 |    11000 |                    0.914992 |                         0.467164 |                   -0.189675 |               0.0569396 |                0.0298394 |               0.549479 |

---

## 12. Where to go next
To makes this a real “effective theory” result (rather than a single-run case study), the next steps are:

1) **Multi-run comparison:** run the same notebook on 2–5 runs that differ in weight decay / init scale / data type (single-freq vs random).  
   - Does \(\ell_{\text{neuron\_norm}}\) predict \(t_\text{grok}\) across runs better than norm-only baselines?  
2) **Weighted coherence matched to alignment weights:** measure phase coherence using the same weights \(w_{j,k}\) to test whether “important neurons” become coherent even if global coherence drops.  
3) **Interventions:** modify training to selectively affect alignment (e.g., constrain phases, change regularization) while keeping norms similar.

---

## Appendix: figure index  
- `001_matplotlib.png`: decoded vs raw comparison (alignment/coherence trajectories)  
- `002_matplotlib.png`: accuracy and loss vs epoch (with grokking time)  
- `003_matplotlib.png`: mechanistic scores (raw + normalized) vs epoch  
- `004_matplotlib.png`: input/output phase concentration heatmaps  
- `005_matplotlib.png`: per-frequency magnitudes heatmaps  
- `006_matplotlib.png`: scatter plots vs test accuracy  
- `007_matplotlib.png`: failure mode: D_global vs neuronwise alignment under low coherence  
- `008_matplotlib.png`: entropy + top-frequency mass over time



### Useful cautionary lessons
1. **Coordinate choices matter**: decoded vs raw pairing can flip signs and alter interpretation. Any mechanistic score must specify coordinate conventions and include a sanity check.
2. **Phase cancellation matters**: if coherence is low, global phasors are unstable summaries; neuronwise alignment is safer.
3. **Norm confounds matter**: strong raw correlations can mostly reflect scale growth. Always compare against magnitude baselines and report scale-controlled variants.


This does not show that the proposed effective loss captures/explains grokking; it's one run, observational, with correlated time-series checkpoints. To support an explanation claim, we need multi-run robustness and interventions.


---

## Citation

He, Jianliang; Wang, Leda; Chen, Siyu; Yang, Zhuoran.  
**On the Mechanism and Dynamics of Modular Addition: Fourier Features, Lottery Ticket, and Grokking.**  
*arXiv preprint* arXiv:2602.16849, 2026.  
https://arxiv.org/abs/2602.16849

If you'd like to cite this blogpost:

```bibtex
@misc{liu2026effective-loss-grokking,
  title        = {Seeking an Effective Loss for Grokking in Modular Addition},
  author       = {Liu, Chryseis},
  year         = {2026},
  month        = {March},
  url          =
  note         = {Blog post}
}
```
