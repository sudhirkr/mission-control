#!/bin/bash
# Usage: request-approval.sh "details" [priority]
# Called by the agent to park an action for human approval

DETAILS="$1"
PRIORITY="${2:-normal}"
ID="approval-$(date +%s)-${RANDOM:0:4}"

QUEUE_FILE="/home/sudhirk/.openclaw/workspace/mission-control/approval-queue.json"

# Read existing queue or create empty
if [ -f "$QUEUE_FILE" ]; then
  QUEUE=$(cat "$QUEUE_FILE")
else
  QUEUE='{"pending":[],"history":[]}'
fi

# Add new item using python (jq might not be available)
python3 -c "
import json, sys
queue = json.loads('''$QUEUE''')
item = {
    'id': '$ID',
    'details': '''$DETAILS''',
    'priority': '$PRIORITY',
    'status': 'pending',
    'createdAt': '$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'
}
queue['pending'] = queue.get('pending', [])
queue['pending'].append(item)
with open('$QUEUE_FILE', 'w') as f:
    json.dump(queue, f, indent=2)
print(f'Created: {item[\"id\"]}')
print(f'Details: {item[\"details\"]}')
print(f'Priority: {item[\"priority\"]}')
"
