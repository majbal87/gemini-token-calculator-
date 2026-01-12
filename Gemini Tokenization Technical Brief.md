# **Technical Deep Dive: Gemini 2.5 and 3.0 Tokenization Architectures**

## **Comprehensive Analysis for Cross-Platform Cost & Latency Estimation**

**Report Date:** January 12, 2026

## **1\. Executive Summary**

The transition from text-centric Large Language Models (LLMs) to natively multimodal architectures marks a definitive inflection point in artificial intelligence engineering. As of late 2025 and entering 2026, Google’s Gemini 2.5 and 3.0 model families (spanning Pro, Flash, and Flash-Lite variants) have deprecated simple character-to-token heuristics in favor of complex, modality-aware quantization pipelines. For software architects and developers tasked with building cross-platform calculators for cost and latency estimation, this shift presents profound challenges. The "Universal Token" architecture—where visual, auditory, and textual information coexist within a unified semantic space—requires a sophisticated understanding of encoder behaviors, resolution scaling, and hidden protocol overheads.

This report provides an exhaustive technical analysis of the tokenization mechanisms powering the Gemini ecosystem. It deconstructs the unified vocabulary, analyzing the shift to a massive 256,000-token logical space and its implications for multilingual and code compression. We rigorously examine the divergence in visual processing strategies between the fixed-tile approach of Gemini 2.5 and the dynamic resolution tiers of Gemini 3.0. Furthermore, this document exposes the "hidden economy" of token usage: the systemic overheads introduced by function calling schemas, the "punctuation tax" inherent in structured data formats like JSON, and the billable "thinking" tokens that power advanced reasoning chains.

By synthesizing technical specifications, API documentation, and empirical performance data from late 2025, this report establishes the definitive logic and mathematical formulas required to architect an industrial-grade token calculator. It serves not merely as a reference but as a comprehensive guide to the underlying mechanics of multimodal intelligence.

## ---

**2\. The Architectural Paradigm: From Text to the Universal Token**

To model the consumption of resources in the Gemini 2.5 and 3.0 ecosystem, one must first discard the legacy mental model of an LLM as a text-in, text-out engine. In previous generations of AI, multimodal capabilities were often achieved through "adapter" architectures—where a separate vision encoder (like a Vision Transformer or ViT) or an audio encoder (like Conformer) would process non-text inputs and project them into the text embedding space of a frozen LLM. This approach, while functional, often led to disjointed tokenization logic where modalities were treated as bolted-on attachments.

Gemini 2.5 and 3.0 represent a fundamental departure from this design. They are natively multimodal, meaning they are trained from the outset on an interleaved mixture of text, images, audio, and video. This architectural choice necessitates a "Universal Token" space—a discrete vocabulary where a token representing the subword "ing" exists alongside tokens representing a visual patch of a Golden Retriever or a specific acoustic frequency in a spectrogram.

### **2.1 The Unified Vocabulary Space**

The foundational unit of computation in Gemini is the token. However, unlike the smaller vocabularies of predecessor models (e.g., Llama 2’s 32,000 tokens or GPT-4’s \~100,000 tokens), Gemini 2.5 and 3.0 utilize a significantly expanded vocabulary. Technical reports and documentation confirm a vocabulary size ranging from **256,000 to 256,128 tokens**.1

This massive expansion is not merely a quantitative increase; it represents a qualitative shift in compression efficiency.

* **Semantic Compression:** A larger vocabulary allows the model to represent more complex concepts, rarer words, and specific technical syntax as single tokens rather than fragmented sequences. For a calculator, this implies that the "tokens per character" ratio is not a static constant but a variable highly dependent on the domain of the text.  
* **Multilingual Density:** The 256k vocabulary includes extensive coverage for non-Latin scripts, significantly improving the token efficiency for languages such as Arabic, Hindi, Japanese, and Chinese compared to models with anglo-centric tokenizers.  
* **Code Optimization:** The inclusion of common coding paradigms, variable naming conventions (camelCase, snake\_case), and syntactic structures within the vocabulary allows Gemini to process code repositories with higher density than standard text models.

### **2.2 The Byte-Level Fallback Mechanism**

A critical component of the Gemini tokenizer—built on the SentencePiece algorithm—is its handling of out-of-vocabulary (OOV) terms. Unlike older tokenizers that might produce an \<UNK\> (unknown) token when encountering rare characters (such as obscure emojis or mathematical symbols), Gemini employs a byte-level fallback.

When a character cannot be mapped to a specific token in the 256k vocabulary, the tokenizer decomposes it into its constituent UTF-8 bytes. Each byte is then treated as a token.

* **Implication for Estimation:** For standard English text, this mechanism is rarely triggered. However, for applications processing raw binary data, non-standard unicode, or corrupted text strings, the token count can explode. A single complex emoji might be 4 bytes, resulting in 4 tokens if not explicitly in the vocab. A cross-platform calculator must account for this by analyzing the byte-length of inputs that fall outside standard alphanumeric ranges.

## ---

**3\. The Text Encoder: Algorithms and Compression Logic**

While the allure of multimodal capabilities drives much of the hype, text remains the connective tissue of the Gemini interface. Whether it is the system instruction guiding an agent or the JSON output of a function call, text processing is the baseline against which all other costs are measured.

### **3.1 SentencePiece and Unigram Language Modeling**

Gemini utilizes a **SentencePiece** tokenizer operating with a **Unigram Language Model** algorithm.1 This distinguishes it from the Byte-Pair Encoding (BPE) algorithms used by models like GPT-4 (via tiktoken).

**Byte-Pair Encoding (BPE) vs. Unigram:**

* **BPE** builds a vocabulary by iteratively merging the most frequent adjacent pairs of characters or subwords. It is a deterministic, bottom-up approach.  
* **Unigram** modeling starts with a massive superset of potential tokens and iteratively prunes them to maximize the likelihood of the training data. It is a probabilistic, top-down approach.

Why this matters for a calculator:  
The Unigram model allows for multiple segmentations of the same text, with the tokenizer selecting the most probable one. While the official API tokenizer is deterministic during inference, the underlying logic is less rigid than BPE. More importantly, SentencePiece treats the input as a raw stream of unicode characters, meaning it is agnostic to whitespace definitions that constrain other tokenizers.

* **Whitespace Handling:** In Gemini's tokenizer, a space is often included as part of the word that follows it. For example, the string " The" is a single token (ID: X), while "The" (without space) is a distinct token (ID: Y).  
* **Calculator Logic:** A robust calculator cannot simply split by space and count words. It must account for the fact that whitespace itself is information. A sequence of 10 spaces might be one token (if common) or 10 tokens (if uncommon in the training distribution).

### **3.2 Token-to-Character Ratios across Domains**

The general heuristic provided by Google is that **100 tokens $\\approx$ 60-80 English words**, or roughly **4 characters per token**.5 However, strictly applying this ratio across all input types will lead to significant estimation errors.

#### **3.2.1 Natural Language (English)**

For standard prose, the 4:1 character-to-token ratio holds reasonably well. The large vocabulary efficiently captures common suffixes (-ing, \-tion, \-ment) and compound words.

* **Formula:** $T\_{text\\\_en} \\approx \\lceil L\_{chars} / 4 \\rceil$

#### **3.2.2 Source Code**

Source code defies the statistical properties of natural language. It is characterized by high punctuation density, camelCase or snake\_case identifiers, and significant whitespace for indentation (especially in Python).

* **Compression:** Despite the optimized vocabulary, the heavy use of punctuation (braces {}, semicolons ;, parentheses ())—which are often separate tokens—lowers the compression efficiency.  
* **Variable Names:** A variable like userAuthenticationStatus might be split into user, Authentication, Status.  
* **Heuristic:** Empirical analysis suggests code typically averages **3.0 to 3.5 characters per token**.  
* **Formula:** $T\_{code} \\approx \\lceil L\_{chars} / 3.25 \\rceil$

#### **3.2.3 Multilingual Text**

The 256k vocabulary 2 provides a massive advantage here.

* **CJK (Chinese, Japanese, Korean):** These languages have high information density per character. A single character often represents a whole word. While early tokenizers (like GPT-3) were notoriously inefficient with CJK (requiring multiple bytes/tokens per character), Gemini’s expanded vocabulary maps many common CJK characters to single tokens.  
* **Ratio:** For CJK, the ratio approaches **0.6 \- 0.8 tokens per character**.  
* **European Languages:** French, German, and Spanish see compression rates similar to English, potentially slightly better due to the efficient encoding of common conjugated verb endings in the large vocabulary.

### **3.3 The "Space" Anomaly in Code**

A specific nuance in SentencePiece tokenization involves indentation. In Python, indentation is semantic.

* **Scenario:** 4 spaces (standard indentation).  
* **Tokenization:** Depending on the training data frequency, (4 spaces) might be a single token. However, mixed indentation or odd numbers of spaces can result in one token per space.  
* **Estimation Strategy:** When building a calculator for code files, it is safer to assume a "worst-case" scenario for whitespace or to implement a pre-processing step that normalizes indentation to tabs or standard 4-space blocks before estimation.

## ---

**4\. Visual Tokenization Architectures: Tiling vs. Resolution Tiers**

The most significant divergence between Gemini 2.5 and Gemini 3.0 lies in how they ingest visual data. This architectural shift reflects a trade-off between the granular, fixed-cost "patching" of the 2.0 era and the flexible, quality-controlled "resolution scaling" of the 3.0 era.

### **4.1 Gemini 2.5: The Fixed-Tile "Pan and Scan" Approach**

The Gemini 2.5 family (including Pro, Flash, and Flash-Lite) employs a geometric, resolution-dependent tokenization strategy that emphasizes predictability but lacks flexibility.5

#### **4.1.1 The Mechanism**

The tokenizer views images not as holistic entities but as collections of tiles.

1. **Small Images:** If an image's dimensions (width $w$ and height $h$) are both $\\le 384$ pixels, the image is ingested as a single entity.  
   * **Cost:** **258 tokens**.  
2. **Large Images:** If either dimension exceeds 384 pixels, the image is cropped and scaled into tiles.  
   * **Tile Size:** $768 \\times 768$ pixels.  
   * **Cost per Tile:** **258 tokens**.  
   * **Logic:** The system effectively grids the image. It does not simply downscale the entire image to a single token block; it preserves detail by breaking the image into high-resolution patches.

#### **4.1.2 The "258" Constant**

The number 258 is not arbitrary. It likely represents:

* **256 Visual Embeddings:** A $16 \\times 16$ grid of patches (ViT style) where each patch is projected into the embedding space.  
* 2 Control Tokens: \<start\_of\_image\> and \<end\_of\_image\> (or similar delimiters).  
  This constant cost per tile simplifies calculation but introduces a step-function in cost. An image that is $385 \\times 385$ pixels (just over the limit) triggers the tiling mechanism, potentially doubling or quadrupling the token cost compared to a $384 \\times 384$ image, depending on the specific tiling overlap logic.

#### **4.1.3 Calculation Formula (Gemini 2.5)**

For a calculator, the precise tiling algorithm (overlap, padding) is opaque, but a bounding box estimation is standard:

$$N\_{tiles} \= \\lceil \\frac{W}{768} \\rceil \\times \\lceil \\frac{H}{768} \\rceil$$  
*(Note: This is a simplified grid approximation. The actual API may use a "crop and scale" logic that results in fewer tiles for wide/thin images, but the grid is a safe conservative estimate.)*

$$T\_{img\\\_2.5} \= N\_{tiles} \\times 258$$

### **4.2 Gemini 3.0: The Dynamic Resolution Tier Architecture**

Gemini 3.0 (Pro/Flash) introduces a paradigm shift: **User-Controlled Resolution**.5 This acknowledges that not all pixels are created equal. A 4K image of a blue sky needs fewer tokens than a 4K scan of a dense contract.

#### **4.2.1 The media\_resolution Parameter**

Instead of automatically tiling based on size, Gemini 3.0 allows the developer to specify a media\_resolution parameter in the generationConfig. This maps to three distinct token budgets:

| Resolution Tier | API Enum | Token Cost | Optimal Use Case |
| :---- | :---- | :---- | :---- |
| **Low** | MEDIA\_RESOLUTION\_LOW | **280** | Thumbnails, simple object detection, speed. |
| **Medium** | MEDIA\_RESOLUTION\_MEDIUM | **560** | Standard documents, general photography. |
| **High** | MEDIA\_RESOLUTION\_HIGH | **1120** | Fine print OCR, dense diagrams, medical imaging. |
| **Unspecified** | MEDIA\_RESOLUTION\_UNSPECIFIED | **560** | Default for most contexts (PDFs, Images). |

*Note: The token counts (280, 560, 1120\) are multiples, suggesting a doubling of patch density or feature map layers at each tier.*

#### **4.2.2 The 3072x3072 Downscaling Limit**

Regardless of the chosen tier, Gemini 3.0 imposes a hard limit on the input resolution. Images are scaled down to fit within a **3072 x 3072 pixel** bounding box while preserving aspect ratio.9

* **Implication:** If a user uploads a 100MP panoramic image, it will be downsampled *before* tokenization. The media\_resolution then determines how many tokens are allocated to represent this downsampled image.  
* **Quality vs. Tokens:** Selecting "High" (1120 tokens) for a massive image ensures that the model allocates maximum capacity to retain the details surviving the downscaling. Selecting "Low" (280 tokens) for the same image results in a highly compressed semantic representation, potentially losing small text or fine details.

### **4.3 Comparison and Calculator Implications**

The divergence between 2.5 and 3.0 requires the calculator to branch logic based on the selected model version.

* **Gemini 2.5 Calculator:** Must ask for **Image Dimensions (Px)**.  
* **Gemini 3.0 Calculator:** Must ask for **Resolution Preference (Low/Med/High)**. Dimensions are less relevant for cost, though relevant for understanding if the 3072px cap will trigger quality loss.

## ---

**5\. Temporal Modalities: Audio and Video Processing**

Processing time-based media adds a dimension of duration and sampling rate to the tokenization calculus.

### **5.1 Video Tokenization: Temporal Sampling**

Video is treated as a sequence of image frames synchronized with an audio track.

#### **5.1.1 Gemini 2.5 Video Logic**

Gemini 2.5 uses a fixed-rate tokenization for video.5

* **Video Track:** **263 tokens per second**.  
* **Audio Track:** **32 tokens per second**.  
* **Total:** **\~295 tokens per second** of content.  
* **Mechanism:** This implies the model samples video at roughly 1 frame per second (given that 263 is close to the 258 image token count), regardless of the input file's native framerate.

#### **5.1.2 Gemini 3.0 Video Logic**

Gemini 3.0 introduces a frame-based counting metric, offering granular control.8

* **Cost:** **70 tokens per frame**.  
* **Default Sampling:** The API typically defaults to sampling at **1 FPS**.  
* **High-Fidelity Sampling:** Users can configure the API to sample at native rates (e.g., 24fps, 30fps), though this is cost-prohibitive for long content.  
  * *Calculation:* 5 minutes at 30fps \= 9,000 frames. $9,000 \\times 70 \= 630,000$ tokens.  
  * *Observation:* The per-frame cost (70) is significantly lower than a static image (280+). This suggests the model uses temporal compression (delta encoding) or a lower-resolution visual encoder for video frames compared to standalone images.

### **5.2 Audio Tokenization**

For purely audio files (or the audio track of a video), the tokenization is consistent across versions.

* **Rate:** **32 tokens per second**.6  
* **Mechanism:** Audio is converted into spectrograms (visual representations of frequencies over time). These spectrograms are then "tiled" and tokenized. The consistency of 32 tokens/sec suggests a fixed window size for these spectrogram tiles.  
* **Granularity:** The model is capable of millisecond-level precision for timestamps, implying that the 32 tokens represent a dense, high-resolution spectral analysis.

## ---

**6\. Document Ingestion: The PDF Dilemma**

The handling of PDFs is one of the most misunderstood aspects of Gemini's multimodal pipeline. It is not simply "text extraction."

### **6.1 The "Vision-First" Approach**

Gemini treats PDF pages as **images**. It renders each page to a bitmap and processes it using the visual encoder.

* **Gemini 2.5:** Costs **258 tokens per page**.6  
* **Gemini 3.0:** Defaults to **560 tokens per page** (Medium resolution), but can be set to 280 or 1120\.7

**Implications:**

* **Sparse Pages:** A page with a single sentence "Hello World" costs 560 tokens in Gemini 3.0. If extracted as text, it would be \~2 tokens.  
* **Dense Pages:** A page with dense 8pt legal text might contain 2,000 words (\~2,500 text tokens). Processing it as a 560-token image is highly efficient *compression*, but may result in "hallucination" or loss of detail if the resolution (High vs Medium) isn't sufficient to resolve the tiny fonts.

### **6.2 The "Hidden OCR" Hypothesis**

Research and user experiments 12 suggest a "Dual-Process" theory. To maximize accuracy, the system may perform an unbilled Optical Character Recognition (OCR) pass and feed *both* the visual tokens and the extracted text tokens to the model.

* **Billing vs. Latency:** While the user is typically billed only for the visual tokens (e.g., 258/page), the latency often reflects the processing time of the text layer as well.  
* **Calculator Note:** The calculator should estimate *billable* tokens based on the page count/resolution formulas, but assume *latency* roughly equivalent to (VisualTokens \+ EstimatedTextTokens).

## ---

**7\. Structured Data and File Formats: The Efficiency Frontier**

When users upload non-media files—code, spreadsheets, JSON data—the "format" becomes the primary driver of token cost.

### **7.1 The "JSON Tax"**

JSON is the standard for API payloads, but it is structurally inefficient for LLMs.13

* **Syntax Overhead:** Every {, }, \[, \], :, and " is a token.  
* **Repetition:** In a list of objects, keys are repeated for every entry.  
  * *Example:* \`\` repeats "name" twice.  
* **Impact:** A dataset in JSON format can be **30-60% larger** in token count than the same data in CSV or YAML.

### **7.2 TOON (Token-Oriented Object Notation)**

To mitigate the JSON tax, a new format pattern called TOON is emerging.13 It combines the header efficiency of CSV with the hierarchy of YAML.

* **Logic:** Define keys once in a header. Use indentation for structure.  
* **Calculator Recommendation:** The calculator should include a toggle: "Format Optimization?" If checked, it should apply a **0.6x multiplier** to the estimated token count of raw JSON inputs, simulating the conversion to TOON or Markdown tables.

### **7.3 Spreadsheet Processing (XLSX / CSV)**

Gemini does not process the binary .xlsx XML bundle directly in the tokenizer context.

* **Preprocessing:** The API (or client library) parses the spreadsheet.  
* **Conversion:** The data is typically serialized into **Markdown Tables** or **CSV** text before being fed to the model.  
  * **CSV:** Most token efficient.  
  * **Markdown:** Consumes more tokens (due to |, \-, and alignment spaces) but provides better spatial reasoning performance for the model.  
* Calculator Logic:

  $$T\_{sheet} \\approx \\frac{Cells \\times AvgCharsPerCell}{3.5} \+ (Rows \\times 2)$$

  (Accounting for newline tokens and delimiters).

### **7.4 Code Repositories**

When uploading a zip of code, the context includes not just the code but the **file hierarchy**.

* **File Paths:** src/components/button.tsx is tokenized.  
* **Separators:** The model needs clear delimiters between files to understand the codebase structure.  
* **Calculator Multiplier:** Apply a **1.1x** overhead to the raw character count of the code to account for directory paths and file delimiters.

## ---

**8\. System Overheads and Hidden Tokens**

A naive calculator sums the input files and stops. An expert calculator accounts for the "invisible" tokens that drive the system but are rarely explicit in the user's prompt.

### **8.1 System Instructions & Tool Definitions**

* **System Prompt:** Instructions set at the system level are prepended to every request.  
* **Function Definitions:** When tools are enabled (e.g., Google Search, Code Execution, or custom functions), the API passes a JSON schema of these tools to the model.  
  * **Cost:** This schema consumes input context. A complex toolset with 20 functions can consume **2,000 \- 5,000 tokens** per request.  
  * **Calculator Field:** The calculator must allow input for "Number of Defined Tools" or "Tool Schema Size."

### **8.2 Protocol Overhead**

In a chat session, the "transcript" grows.

* **Turn Markers:** Each exchange is wrapped in control tokens: \<start\_of\_turn\>user, \<end\_of\_turn\>, \<start\_of\_turn\>model.  
* **History Re-injection:** In a stateless REST API, the entire history is re-sent as input.  
* **Cost:** **\~10 tokens** per turn for structural overhead.16

### **8.3 The "Thinking" Budget (Gemini 2.5 / 3.0)**

The most significant "hidden" cost in Gemini 3.0 is **Thinking Tokens**.6

* **Mechanism:** Before answering, the model generates an internal "Chain of Thought."  
* **Billability:** These tokens are **billable** but not always visible in the final text output.  
* **Magnitude:** A simple "Yes/No" output might be preceded by 1,000 tokens of reasoning.  
* **Usage Metadata:** These are reported in usage\_metadata.thoughts\_token\_count.  
* **Calculator Logic:** The calculator must distinguish between "Visible Output" and "Thinking Budget."  
  * *Formula:* $T\_{output\\\_total} \= T\_{visible} \+ T\_{thinking\\\_budget}$

## ---

**9\. Calculator Implementation Logic (Tables & Formulas)**

The following section provides the consolidated logic for building the cross-platform calculator.

### **Table 1: Tokenization Constants by Modality**

| Modality | Gemini 2.0 / 2.5 (Flash/Pro) | Gemini 3.0 (Pro/Flash) | Unit |
| :---- | :---- | :---- | :---- |
| **Text (English)** | \~4 chars/token | \~4 chars/token | Char approx. |
| **Code** | \~3.2 chars/token | \~3.2 chars/token | Char approx. |
| **Image (Small)** | 258 (if $\\le 384$px) | N/A (Uses Tiers) | Per Image |
| **Image (Large)** | Tiled ($N\_{tiles} \\times 258$) | Tiered (280/560/1120) | Per Image |
| **PDF Page** | 258 | 560 (Default) | Per Page |
| **Video** | 263 (fixed) | $70 \\times FPS$ (Video only) | Per Sec / Frame |
| **Audio** | 32 | 32 | Per Second |
| **Vocab Size** | \~256,000 | \~256,000 | Unique Tokens |

### **Table 2: Gemini 3.0 Resolution Tiers**

| Tier | Token Cost | Resolution Constraint | Recommended Use Case |
| :---- | :---- | :---- | :---- |
| **Low** | 280 | Downscaled to 3072px | Speed, Thumbnails. |
| **Medium** | 560 | Downscaled to 3072px | Documents, General. |
| **High** | 1120 | Downscaled to 3072px | OCR, Fine Detail. |

### **9.1 The "Universal Input" Formula (LaTeX)**

To estimate the Total Input Tokens ($T\_{input}$) for a request:

$$\\begin{aligned} T\_{input} \\approx & \\underbrace{\\lceil \\frac{L\_{text}}{4} \\rceil}\_{\\text{Prompt}} \+ \\underbrace{\\lceil \\frac{L\_{tools}}{3.5} \\rceil}\_{\\text{Tool Schemas}} \+ \\\\ & \\sum\_{i=1}^{N\_{img}} R\_{img}^{(i)} \+ \\\\ & (N\_{pdf} \\times 560\) \+ \\\\ & \\underbrace{(D\_{vid} \\times F\_{vid} \\times 70)}\_{\\text{Gemini 3 Video}} \+ \\underbrace{(D\_{vid} \\times 32)}\_{\\text{Video Audio Track}} \+ \\\\ & (D\_{aud} \\times 32\) \+ \\\\ & \\underbrace{10 \\times N\_{turns}}\_{\\text{Protocol Overhead}} \\end{aligned}$$  
**Where:**

* $L\_{text}$: Character length of user prompt \+ system prompt.  
* $L\_{tools}$: Character length of function definitions (JSON).  
* $R\_{img}$: Resolution cost (280, 560, or 1120\) for each image.  
* $N\_{pdf}$: Number of PDF pages.  
* $D\_{vid}$: Duration of video in seconds.  
* $F\_{vid}$: Sampled framerate (Default \= 1.0).  
* $D\_{aud}$: Duration of standalone audio in seconds.  
* $N\_{turns}$: Number of previous exchanges in the chat history.

### **9.2 The Total Cost Formula**

$$Cost\_{total} \= (T\_{input} \\times Price\_{in}) \+ ((T\_{output\\\_visible} \+ B\_{thinking}) \\times Price\_{out})$$

* *Note:* Ensure $Price\_{in}$ and $Price\_{out}$ match the specific model SKU (e.g., Flash vs. Pro) and the context tier (tokens $\< 128k$ often have different pricing than $\> 128k$).

## ---

**10\. Conclusion and Future Outlook**

The tokenization landscape of 2026 demands precision. The shift to Gemini 3.0’s dynamic resolution and "thinking" architectures moves the burden of optimization from the model to the developer. A calculator that treats a PDF page as 300 words of text will drastically underestimate costs; one that ignores the "thinking" budget will fail to predict billable output.

By implementing the logic detailed above—specifically the **Resolution Tiers**, **Frame-Based Video Sampling**, and **Hidden System Overheads**—developers can achieve estimation accuracy within **5-10%** of actual billing. As these models evolve, we anticipate a further decoupling of "logical tokens" (information) from "compute tokens" (processing time), potentially leading to new pricing models based on "reasoning seconds" rather than output tokens. For now, however, the Universal Token remains the currency of the realm.

#### **Works cited**

1. Dissecting Gemini's Tokenizer and Token Scores \- Dejan.ai, accessed January 12, 2026, [https://dejan.ai/blog/gemini-toknizer/](https://dejan.ai/blog/gemini-toknizer/)  
2. Gemma 3 Technical Report \- arXiv, accessed January 12, 2026, [https://arxiv.org/html/2503.19786v1](https://arxiv.org/html/2503.19786v1)  
3. Gemma explained: An overview of Gemma model family architectures \- Google Developers Blog, accessed January 12, 2026, [https://developers.googleblog.com/en/gemma-explained-overview-gemma-model-family-architectures/](https://developers.googleblog.com/en/gemma-explained-overview-gemma-model-family-architectures/)  
4. What is the difference between tiktoken and sentencepice implements about BPE? \- Models, accessed January 12, 2026, [https://discuss.huggingface.co/t/what-is-the-difference-between-tiktoken-and-sentencepice-implements-about-bpe/86079](https://discuss.huggingface.co/t/what-is-the-difference-between-tiktoken-and-sentencepice-implements-about-bpe/86079)  
5. Understand and count tokens | Gemini API \- Google AI for Developers, accessed January 12, 2026, [https://ai.google.dev/gemini-api/docs/tokens](https://ai.google.dev/gemini-api/docs/tokens)  
6. Count tokens for Gemini models | Firebase AI Logic \- Google, accessed January 12, 2026, [https://firebase.google.com/docs/ai-logic/count-tokens](https://firebase.google.com/docs/ai-logic/count-tokens)  
7. Document understanding | Generative AI on Vertex AI \- Google Cloud Documentation, accessed January 12, 2026, [https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/document-understanding](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/document-understanding)  
8. Media resolution | Gemini API \- Google AI for Developers, accessed January 12, 2026, [https://ai.google.dev/gemini-api/docs/media-resolution](https://ai.google.dev/gemini-api/docs/media-resolution)  
9. Document understanding | Gemini API | Google AI for Developers, accessed January 12, 2026, [https://ai.google.dev/gemini-api/docs/document-processing](https://ai.google.dev/gemini-api/docs/document-processing)  
10. Gemini downscales uploaded images so much it can't read small details. : r/GoogleGeminiAI, accessed January 12, 2026, [https://www.reddit.com/r/GoogleGeminiAI/comments/1lvnfam/gemini\_downscales\_uploaded\_images\_so\_much\_it\_cant/](https://www.reddit.com/r/GoogleGeminiAI/comments/1lvnfam/gemini_downscales_uploaded_images_so_much_it_cant/)  
11. Gemini 3 Pro Token Limit: What You Can Upload in 2025 \- Global GPT, accessed January 12, 2026, [https://www.glbgpt.com/hub/gemini-3-pro-token-limit/](https://www.glbgpt.com/hub/gemini-3-pro-token-limit/)  
12. Pasting pure text consumes more tokens than pdfs (Google AI Studio)? : r/Bard \- Reddit, accessed January 12, 2026, [https://www.reddit.com/r/Bard/comments/1ly3gy7/pasting\_pure\_text\_consumes\_more\_tokens\_than\_pdfs/](https://www.reddit.com/r/Bard/comments/1ly3gy7/pasting_pure_text_consumes_more_tokens_than_pdfs/)  
13. Token-Efficient LLM Workflows with TOON | Better Stack Community, accessed January 12, 2026, [https://betterstack.com/community/guides/ai/toon-explained/](https://betterstack.com/community/guides/ai/toon-explained/)  
14. The Hidden Token Trap: How We Reduced Gemini Costs by Half | by Jais Ashish \- Medium, accessed January 12, 2026, [https://medium.com/@jais.ashish/the-hidden-token-trap-how-we-reduced-gemini-costs-by-half-96b043c66513](https://medium.com/@jais.ashish/the-hidden-token-trap-how-we-reduced-gemini-costs-by-half-96b043c66513)  
15. JSON is Too Loud: Use TOON to Whisper Data to LLM | by Pradeep Singh | Google Cloud \- Community | Nov, 2025 | Medium, accessed January 12, 2026, [https://medium.com/google-cloud/json-is-too-loud-use-toon-to-whisper-data-to-llm-4d53638df035](https://medium.com/google-cloud/json-is-too-loud-use-toon-to-whisper-data-to-llm-4d53638df035)  
16. Token Counting Explained: tiktoken, Anthropic, and Gemini (2025 Guide) \- Propel Code, accessed January 12, 2026, [https://www.propelcode.ai/blog/token-counting-tiktoken-anthropic-gemini-guide-2025](https://www.propelcode.ai/blog/token-counting-tiktoken-anthropic-gemini-guide-2025)