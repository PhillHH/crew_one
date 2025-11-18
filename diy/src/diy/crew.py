from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List

from diy.tools import bauhaus_search


@CrewBase
class Diy():
    """Diy crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # --- Agents ---
    @agent
    def researcher_general(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher_general'],  # YAML-Agent
            verbose=True,
            tools=[bauhaus_search],
        )

    @agent
    def researcher_safety(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher_safety'],
            verbose=True
        )

    @agent
    def reporting_writer(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_writer'],
            verbose=True
        )

    @agent
    def quality_manager(self) -> Agent:
        return Agent(
            config=self.agents_config['quality_manager'],
            verbose=True
        )

    @agent
    def purchasing_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['purchasing_agent'],
            verbose=True
        )

    # --- Tasks ---
    @task
    def planning_task(self) -> Task:
        return Task(
            config=self.tasks_config['planning_task'],
        )

    @task
    def safety_task(self) -> Task:
        return Task(
            config=self.tasks_config['safety_task'],
        )

    @task
    def writing_task(self) -> Task:
        return Task(
            config=self.tasks_config['writing_task'],
            output_file='report.md'
        )

    @task
    def quality_check_task(self) -> Task:
        return Task(
            config=self.tasks_config['quality_check_task'],
        )

    @task
    def purchasing_task(self) -> Task:
        return Task(
            config=self.tasks_config['purchasing_task'],
        )

    # --- Crew ---
    @crew
    def crew(self) -> Crew:
        """Erstellt die DIY-Crew und legt den Prozess fest."""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,  # Tasks werden nacheinander abgearbeitet
            verbose=True,
        )
