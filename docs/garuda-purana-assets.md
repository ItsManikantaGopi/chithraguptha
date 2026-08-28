# Garuda Purāṇa Asset Dictionary

This manifest documents the visual assets used by Chithraguptha's Garuda Purāṇa experience. It deliberately separates **scriptural tradition**, **historical reference imagery**, and **original generated artwork** so the UI never presents an illustration as if it were a photograph or a literal archaeological depiction.

## Visual asset policy

- `public/assets/garuda-purana/*.svg` — original manuscript-inspired illustrations created for this project. They are visual interpretations, not claims about what the historical text or deities literally look like.
- `public/assets/cinematic/*.webp` — existing cinematic concept artwork used by the product.
- Historical manuscript photography should be sourced from repositories with explicit licensing metadata. A verified Wikimedia Commons Garuda Purāṇa manuscript photograph is listed below.
- Do not use AI-generated artwork as evidence for a scriptural claim. Pair every visual with a textual source note.

## Assets

| Asset | Type | UI role | What is depicted | Source / rights |
|---|---|---|---|---|
| `garuda-purana-manuscript.svg` | Original SVG | Garuda Purāṇa landing hero | A Devanāgarī manuscript-inspired title treatment for गरुडपुराणम् | Original project artwork |
| `garuda-vishnu-dialogue.svg` | Original SVG | Journey section | Abstract composition representing Garuḍa receiving teachings associated with Viṣṇu | Original project artwork; non-literal |
| `yama-chitragupta-ledger.svg` | Original SVG | Chitragupta / judgment section | Stylised Yama–Chitragupta ledger motif | Original project artwork; non-literal |
| `naraka-vaitarani.svg` | Original SVG | Naraka atlas | Abstract Vaitaraṇī / consequence scene | Original project artwork; non-literal |
| `naraka-kumbhipaka.svg` | Original SVG | Naraka atlas | Abstract Kumbhīpāka-inspired scene | Original project artwork; non-literal |
| `cinematic/chitragupta.webp` | Existing WebP | Homepage / judgment | Cinematic Chitragupta concept art | Existing project asset |
| `cinematic/garuda.webp` | Existing WebP | Garuda section | Cinematic Garuḍa concept art | Existing project asset |
| `cinematic/manuscript.webp` | Existing WebP | Scripture section | Cinematic manuscript concept art | Existing project asset |
| `cinematic/temple.webp` | Existing WebP | Dharma context | Temple / devotional environment concept art | Existing project asset |
| `cinematic/chithraguptha-hero.webp` | Existing WebP | Homepage hero | Cinematic Chithraguptha environment | Existing project asset |
| `cinematic/chithraguptha-variants.webp` | Existing WebP | Visual variants | Alternate Chithraguptha concept compositions | Existing project asset |

## Verified historical reference image

**Garuda Purana, Sanskrit, Devanagari.jpg** on Wikimedia Commons is a photograph of a Garuda Purāṇa manuscript page. The Commons page identifies the language as Sanskrit, script as Devanagari, and states that the photographed manuscript was acquired in the 19th century and produced in or before that acquisition. The photographer released the photograph under **CC BY-SA 4.0**. If this reference is copied into the repository later, retain attribution and share-alike requirements.

Reference: https://commons.wikimedia.org/wiki/File:Garuda_Purana,_Sanskrit,_Devanagari.jpg

## Garuda Purāṇa content map

The Garuda Purāṇa is a Purāṇa associated with a dialogue between Garuḍa and Viṣṇu. Its material is broader than the popular internet image of a single “book of hell punishments”: it includes cosmological, devotional, ethical, death/afterlife, ritual and other subjects. The product should therefore frame the Naraka material as **one part of a larger tradition**.

### Product sections

1. **The text** — what the Garuda Purāṇa is and why it matters.
2. **The journey** — death, the preta journey, Yama's domain and post-mortem consequence as represented in the relevant tradition.
3. **Chitragupta** — the cultural/theological idea of a recorder of deeds and the product's “Ledger” metaphor.
4. **Naraka atlas** — a visual index of hell realms and their moral associations.
5. **Prāyaścitta / remedy** — present remedies as dharmic practices and traditions of atonement, not as a guaranteed transactional cancellation of karma.
6. **Dharma** — move the user from fear of punishment toward reflection, responsibility, compassion and better conduct.

## Naraka name index

Popular secondary sources often present a list of 28 Narakas, but lists and associations vary across Hindu textual traditions. The product should label this as a **traditional Naraka atlas** rather than claiming that every modern list is a verbatim one-to-one extraction from one edition of the Garuda Purāṇa.

Commonly encountered names include:

1. Tāmīsra
2. Andhatāmīsra
3. Raurava
4. Mahāraurava
5. Kumbhīpāka
6. Kālasūtra
7. Asipatravana / Asi-patravana
8. Śūkaramukha
9. Andhakūpa
10. Kṛmibhojana / Kṛmibhakṣa
11. Sandaṃśa
12. Taptasūrmi
13. Vajrakaṇṭaka-śālmalī
14. Vaitaraṇī
15. Pūyoda
16. Prāṇarodha
17. Viśasana
18. Lālābhakṣa
19. Sārameyādana / Sārameyāsana
20. Avīci
21. Ayaḥpāna
22. Kṣārakardama
23. Rakṣogaṇa-bhojana / Rakṣobhakṣa
24. Śūlaprota
25. Daṇḍaśūka
26. Avata-nirodhana / related variant names in secondary lists
27. Paryāvartanaka
28. Sūcīmukha

**Editorial rule:** before attaching a specific sin, punishment, duration or remedy to a Naraka, verify the claim against the exact Sanskrit edition/translation being cited. Do not silently merge a Bhagavata Purāṇa list, a Devi Bhāgavata list, later retellings and a Garuda Purāṇa translation into one “canonical” table.

## Remedy / prāyaścitta UX rule

The product can offer reflective next steps such as:

- acknowledge the harm without excuses;
- repair or restore what can be restored;
- apologise where appropriate;
- give charity or service without treating it as a purchase of forgiveness;
- cultivate truthfulness, non-violence, compassion and restraint;
- follow a suitable vrata, prayer, japa or other practice when it belongs to the user's tradition;
- seek guidance from a qualified traditional teacher for serious religious questions.

The interface should say **“traditional remedy / path of atonement”**, not **“guaranteed way to cancel this punishment.”**

## Research references

- Wikimedia Commons manuscript reference: https://commons.wikimedia.org/wiki/File:Garuda_Purana,_Sanskrit,_Devanagari.jpg
- Garuda Purāṇa overview and Naraka discussion: https://mahakal.com/blog/en/28-types-of-hell-in-garuda-purana-sins-punishments-the-souls-journey-explained
- Comparative Naraka overview: https://indianastrology.co.in/6844-naraka-punishments-naraka-hinduism-garuda-purana-punishments/

These web references are **research aids**, not substitutes for a critical Sanskrit edition. The product should eventually cite the edition/translation used for each detailed claim.
