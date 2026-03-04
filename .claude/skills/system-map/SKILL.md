---
name: system-map
description: Converts a technical description into a React Flow JSON structure.
---
When invoked, follow these steps:
1. Analyze the system components (databases, services, proxies).
2. Assign coordinates (x, y) to each node to avoid overlap (auto-layout).
3. Define "edges" for data flow.
4. Output a JSON object formatted for the `ultimate_planner` schema.

Constraint: Use the 'Senior Architect' node types defined in our `ServiceNode.tsx`.