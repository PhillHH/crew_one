from crewai import tool
from duckduckgo_search import DDGS

@tool("bauhaus_search")
def bauhaus_search(query: str) -> str:
    """
    Searches for products and guides on bauhaus.info.

    Args:
        query: The search query.

    Returns:
        A formatted string with the top 5 search results.
    """
    with DDGS() as ddgs:
        results = [
            r for r in ddgs.text(
                f"site:bauhaus.info {query}",
                max_results=5
            )
        ]

    if not results:
        return "No results found on bauhaus.info."

    return "\\n".join(
        f"- [{res['title']}]({res['href']}) - {res.get('body', '')}"
        for res in results
    )
