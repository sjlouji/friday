from langchain_ollama import OllamaLLM
from langchain.agents import AgentExecutor, LLMSingleActionAgent
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.tools import Tool
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from langchain.chains import LLMChain

from typing import List, Union, Tuple, Any
import re

class FinancialAgent:
    def __init__(self):
        self.llm = OllamaLLM(model="mistral")
        self.memory = ConversationBufferMemory(memory_key="chat_history", input_key="input")
        self.tools = [
            Tool(
                name="get_financial_data",
                func=lambda x: "Financial data retrieved.",
                description="Retrieves financial data based on the query."
            ),
            Tool(
                name="categorize_transaction",
                func=lambda x: "Transaction categorized.",
                description="Categorizes a transaction based on the input."
            )
        ]
        prompt = PromptTemplate(
            template="""You are a financial assistant. You have access to the following tools:

{tools}

IMPORTANT: You must follow this EXACT format for your response:

Question: {input}
Thought: [Your reasoning about what to do]
Action: [Must be one of: {tool_names}]
Action Input: [Your input for the action]
Observation: [Result of the action]
Thought: [Your reasoning about the observation]
Final Answer: [Your final response to the user]

Remember:
1. You MUST use one of the available tools
2. You MUST follow the format EXACTLY
3. You MUST start with "Thought:" after the question
4. You MUST end with "Final Answer:"
5. You MUST include "Action:" and "Action Input:" in your response
6. You MUST wait for the Observation before giving the Final Answer

Begin!

Question: {input}
Thought:""",
            input_variables=["input", "tools", "tool_names"]
        )
        self.agent_executor = AgentExecutor.from_agent_and_tools(
            agent=LLMSingleActionAgent(
                llm_chain=LLMChain(
                    llm=self.llm,
                    prompt=prompt,
                    verbose=True
                ),
                output_parser=ReActSingleInputOutputParser(),
                stop=["\nObservation:"],
                allowed_tools=[tool.name for tool in self.tools]
            ),
            tools=self.tools,
            verbose=True,
            memory=self.memory,
            handle_parsing_errors=True,
            max_iterations=3
        )

    def process_query(self, query):
        return self.agent_executor.run(
            input=query,
            tools="\n".join([f"{tool.name}: {tool.description}" for tool in self.tools]),
            tool_names=", ".join([tool.name for tool in self.tools])
        )

class TransactionAgent:
    def __init__(self):
        self.llm = OllamaLLM(model="mistral")
        self.memory = ConversationBufferMemory(memory_key="chat_history", input_key="input")
        self.tools = [
            Tool(
                name="categorize_transaction",
                func=lambda x: "Transaction categorized.",
                description="Categorizes a transaction based on the input."
            )
        ]
        prompt = PromptTemplate(
            template="""You are a transaction assistant. You have access to the following tools:

{tools}

IMPORTANT: You must follow this EXACT format for your response:

Question: {input}
Thought: [Your reasoning about what to do]
Action: [Must be one of: {tool_names}]
Action Input: [Your input for the action]
Observation: [Result of the action]
Thought: [Your reasoning about the observation]
Final Answer: [Your final response to the user]

Remember:
1. You MUST use one of the available tools
2. You MUST follow the format EXACTLY
3. You MUST start with "Thought:" after the question
4. You MUST end with "Final Answer:"
5. You MUST include "Action:" and "Action Input:" in your response
6. You MUST wait for the Observation before giving the Final Answer

Begin!

Question: {input}
Thought:""",
            input_variables=["input", "tools", "tool_names"]
        )
        self.agent_executor = AgentExecutor.from_agent_and_tools(
            agent=LLMSingleActionAgent(
                llm_chain=LLMChain(
                    llm=self.llm,
                    prompt=prompt,
                    verbose=True
                ),
                output_parser=ReActSingleInputOutputParser(),
                stop=["\nObservation:"],
                allowed_tools=[tool.name for tool in self.tools]
            ),
            tools=self.tools,
            verbose=True,
            memory=self.memory,
            handle_parsing_errors=True,
            max_iterations=3
        )

    def process_query(self, query):
        return self.agent_executor.run(
            input=query,
            tools="\n".join([f"{tool.name}: {tool.description}" for tool in self.tools]),
            tool_names=", ".join([tool.name for tool in self.tools])
        ) 