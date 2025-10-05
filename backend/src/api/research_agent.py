"""
Research Agent API endpoints.

Provides autonomous research capabilities through a Plan-and-Execute agent.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from ..services.research_agent import get_research_agent

logger = logging.getLogger(__name__)

router = APIRouter()


class ResearchRequest(BaseModel):
    """Request model for research queries."""
    query: str
    session_id: Optional[str] = None


class PlanRequest(BaseModel):
    """Request model for plan generation only."""
    query: str


@router.post("/research")
async def perform_research(request: ResearchRequest):
    """
    Perform autonomous research based on natural language query.

    The agent will:
    1. Create a plan to answer the query
    2. Execute the plan step-by-step
    3. Return comprehensive results

    Args:
        request: Research query and optional session ID

    Returns:
        Complete research results including plan and execution details
    """
    try:
        agent = get_research_agent()
        result = await agent.research(request.query)

        return {
            "success": True,
            "query": request.query,
            "plan": result['plan'],
            "execution": result['execution'],
            "final_answer": result.get('final_answer'),
            "timestamp": result['timestamp']
        }

    except Exception as e:
        logger.error(f"Error performing research: {e}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")


@router.post("/plan")
async def create_plan(request: PlanRequest):
    """
    Create a research plan without executing it.

    Useful for showing users the planned approach before execution.

    Args:
        request: Query to create plan for

    Returns:
        Structured plan with steps and estimated time
    """
    try:
        agent = get_research_agent()
        plan = await agent.create_plan(request.query)

        return {
            "success": True,
            "plan": plan,
            "note": "This is the planned approach. Use /research to execute."
        }

    except Exception as e:
        logger.error(f"Error creating plan: {e}")
        raise HTTPException(status_code=500, detail=f"Plan creation failed: {str(e)}")


@router.post("/execute-plan")
async def execute_plan(plan: dict):
    """
    Execute a previously created plan.

    Args:
        plan: The plan object to execute

    Returns:
        Execution results with status for each step
    """
    try:
        agent = get_research_agent()
        result = await agent.execute_plan(plan)

        return {
            "success": True,
            "execution": result
        }

    except Exception as e:
        logger.error(f"Error executing plan: {e}")
        raise HTTPException(status_code=500, detail=f"Plan execution failed: {str(e)}")
