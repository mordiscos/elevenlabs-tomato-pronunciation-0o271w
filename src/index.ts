import fs from 'fs';
import { ElevenLabsClient, PronunciationDictionaryLocator, PronunciationRule } from 'elevenlabs';

async function main() {
    const apiKey = "YOUR_API_KEY";
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const pronunciationDictionaryFilePath = '/path/to/your/pronunciationDictionaryFile.pls';
    const voiceId = "Rachel";
    const text = "tomato";

    // Step 1: Create a pronunciation dictionary from a file
    const pronunciationDictionaryFile = fs.createReadStream(pronunciationDictionaryFilePath);
    const createPronunciationDictionaryResponse = await elevenlabs.pronunciationDictionary.createFromFile(
        pronunciationDictionaryFile,
        { name: "TomatoPronunciationDictionary" }
    );

    // Step 2: Play "tomato" with the voice id "Rachel"
    let playResponse = await elevenlabs.textToSpeech.convert(voiceId, {
        text: text,
        pronunciation_dictionary_locators: [{
            pronunciation_dictionary_id: createPronunciationDictionaryResponse.id,
            version_id: createPronunciationDictionaryResponse.version_id
        }]
    });
    console.log("Audio URL:", playResponse.audio_url);

    // Step 3: Remove the "tomato" rule
    await elevenlabs.pronunciationDictionary.removeRulesFromThePronunciationDictionary(
        createPronunciationDictionaryResponse.id,
        { rule_strings: [text] }
    );

    // Step 4: Play "tomato" again with the voice id "Rachel"
    playResponse = await elevenlabs.textToSpeech.convert(voiceId, { text: text });
    console.log("Audio URL after removal:", playResponse.audio_url);

    // Step 5: Add the "tomato" rule again using phoneme
    await elevenlabs.pronunciationDictionary.addRulesToThePronunciationDictionary(
        createPronunciationDictionaryResponse.id,
        {
            rules: [{
                string_to_replace: text,
                type: "phoneme",
                phoneme: "təˈmɑːtoʊ",
                alphabet: "ipa"
            }]
        }
    );

    // Step 6: Play "tomato" once more with the voice "Rachel"
    playResponse = await elevenlabs.textToSpeech.convert(voiceId, {
        text: text,
        pronunciation_dictionary_locators: [{
            pronunciation_dictionary_id: createPronunciationDictionaryResponse.id,
            version_id: createPronunciationDictionaryResponse.version_id
        }]
    });
    console.log("Final audio URL:", playResponse.audio_url);
}

main().catch(console.error);
