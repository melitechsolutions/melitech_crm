# Project Task Management - Quick Start Guide

## Accessing Task Management

Navigate to any project and click on the **Tasks** tab to access the task management interface.

## Features Overview

### 1. Create New Task
**Button:** "New Task" (top right of Task tab)

**Steps:**
1. Click "New Task" button
2. Fill in required fields:
   - **Task Title** (required)
   - **Description** (optional)
   - **Priority** (low/medium/high/urgent)
   - **Status** (todo/in_progress/review/completed/blocked)
   - **Assign To** (select team member or leave unassigned)
   - **Due Date** (optional)
   - **Estimated Hours** (optional)
3. Click "Create Task"

**Result:** Task appears in task list with status "Pending" (awaiting approval)

---

### 2. View and Filter Tasks

**Available Filters:**
- **Status Filter**: Show tasks by their current status
- **Priority Filter**: View only high-priority or urgent tasks
- **Assignee Filter**: See tasks assigned to specific team members
- **Approval Filter** (admins only): View pending/approved/rejected tasks

**Filtering:**
1. Use dropdown filters at top of task list
2. Select filter criteria
3. Table updates automatically
4. Use "Refresh" button to reload latest data

---

### 3. Edit Task

**Steps:**
1. Click the **Edit** icon (pencil) next to any task
2. Modify task details:
   - Title, description
   - Priority and status
   - Assigned team member
   - Due date
   - Estimated/actual hours worked
3. Click "Save Changes"

**For Admins Only:**
- View current approval status
- See approval history and remarks
- Click "Review & Approve/Reject" to approve/reject task

---

### 4. Admin Approval Workflow

### For Project Managers/Admins:

**Approve Task:**
1. Click Edit on a pending task
2. Click "Review & Approve/Reject" button
3. (Optional) Add approval remarks
4. Click "Approve" button
5. Task status changes to "Approved"

**Request Revision:**
1. Click Edit on a pending task
2. Click "Review & Approve/Reject" button
3. Add revision remarks (required)
4. Click "Request Revision" button
5. Task status changes to "Revision Requested"

**Reject Task:**
1. Click Edit on a pending task
2. Click "Review & Approve/Reject" button
3. Enter rejection reason (required)
4. Click "Reject" button
5. Task status changes to "Rejected"

---

### 5. Delete Task

**Steps:**
1. Click the **Delete** icon (trash) next to any task
2. Confirm deletion in popup
3. Task is removed from project

**Warning:** Deletion is permanent and cannot be undone.

---

## Task Status Reference

| Status | Meaning | Next Action |
|--------|---------|-------------|
| todo | Awaiting work to start | Assign and begin |
| in_progress | Currently being worked on | Update actual hours |
| review | Work complete, awaiting review | Admin approval/revision |
| completed | Work finished and approved | Archive or close |
| blocked | Task is blocked by issues | Unblock or adjust |

---

## Approval Status Reference

| Status | Meaning | Action |
|--------|---------|--------|
| pending | Awaiting admin review | Admin must approve/reject/request revision |
| approved | Approved by admin | Can proceed to next status |
| rejected | Rejected by admin | Review rejection reason and resubmit |
| revision_requested | Revisions needed | Update task per remarks and resubmit |

---

## Tips for Best Practice

### For Team Members:
✅ Update task status as work progresses
✅ Record actual hours spent on task
✅ Use clear, descriptive task titles
✅ Set realistic estimated hours
✅ Monitor admin remarks for feedback

### For Admins/Managers:
✅ Review pending tasks regularly
✅ Add clear remarks when requesting revisions
✅ Provide rejection reasons for transparency
✅ Use approval remarks for communication
✅ Filter by "Pending" approval to stay on top

### General:
✅ Use appropriate priority levels
✅ Assign tasks to specific team members
✅ Set realistic due dates
✅ Check approval status before considering task complete
✅ Use activity log to track task history

---

## Common Workflows

### Creating a Project Task:
1. Create Task → todo status
2. Assign to team member
3. Set due date and estimated hours
4. Team member updates progress
5. Admin reviews and approves
6. Task marked as completed

### Team Member Development Flow:
1. Check tasks assigned to you
2. Update status to "in_progress"
3. Track actual hours
4. Move to "review" when complete
5. Wait for admin approval
6. Address any revision requests
7. Once approved, mark "completed"

### Reviewing and Approving Tasks:
1. Filter to show "Pending" approval tasks
2. Click each task to review details
3. Add remarks if needed
4. Choose: Approve / Request Revision / Reject
5. Approved tasks can proceed
6. Rejected tasks return to team for revisions

---

## Keyboard Shortcuts

Currently no keyboard shortcuts available. Use mouse/touch to interact with UI.

---

## Troubleshooting

**Task not showing up?**
- Refresh the page or click "Refresh" button
- Check filters to ensure task status is displayed
- Verify you have access to the project

**Can't approve/reject task?**
- Only admins/project managers can approve tasks
- Task must be in "pending" status
- You must be logged in with proper permissions

**Changes not saving?**
- Check for error messages at bottom of form
- Ensure all required fields are filled
- Try refreshing and re-editing

**"Add remarks" field disabled?**
- Only appears when clicking "Review & Approve/Reject"
- Required for reject and revision actions

---

## Support

For issues or feature requests, contact your system administrator.
