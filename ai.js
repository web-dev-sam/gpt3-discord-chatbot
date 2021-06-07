
const OpenAI = require('openai-api');
const rp = require('request-promise');
const config = require('./config');
const openai = new OpenAI(config.GPT3_TOKEN);

const REMEMBER = 8;
const NORMAL = {
    start: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. \n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?`,
    maxTokens: 150,
    temperature: 0.9,
    topP: 1,
    presencePenalty: 0.6,
    frequencyPenalty: 0,
    name: "AI",
    otherName: "Human"
}
const AI_MODIFIER = NORMAL;

class AI {

    constructor() {
        this.lastResponse;
        this.conversation = [];
    }


    /**
     * Add human message to conversation
     * 
     * @param {string} message What the human said
     */
    human(message) {
        if (this.conversation.length >= REMEMBER) {
            this.conversation.shift();
            this.conversation.shift();
        }

        this.conversation.push({
            author: 1,
            prompt: message
        });

        console.log(AI_MODIFIER.otherName + ":", message);
    }


    /**
     * Add AI message to conversation
     * 
     * @param {string} message What the AI said
     */
    ai(message) {
        this.conversation.push({
            author: 0,
            prompt: message
        });
        console.log(AI_MODIFIER.name + ":", message);
    }


    /**
     * Generate the conversation that OpenAI receives
     */
    getConversation() {
        let conv = AI_MODIFIER.start;

        for (const message of this.conversation) {
            conv += `\n${message.author ? AI_MODIFIER.otherName : AI_MODIFIER.name}: ${message.prompt}`;
        }

        conv += `\n${AI_MODIFIER.name}:`;

        return conv;
    }


    /**
     * Call GPT-3 API
     */
    async completion() {
        const gptResponse = await openai.complete({
            engine: 'davinci',
            prompt: this.getConversation(),
            maxTokens: AI_MODIFIER.maxTokens,
            temperature: AI_MODIFIER.temperature,
            topP: AI_MODIFIER.topP,
            presencePenalty: AI_MODIFIER.presencePenalty,
            frequencyPenalty: AI_MODIFIER.frequencyPenalty,
            bestOf: 1,
            n: 1,
            stream: false,
            stop: ["\n", AI_MODIFIER.otherName + ":", AI_MODIFIER.name + ":"]
        });

        return gptResponse.data;
    }
}

module.exports = AI;