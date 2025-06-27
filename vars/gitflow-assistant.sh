#!/bin/bash

# ------------------------------------
# Interactive Git Flow Script
# ------------------------------------
#
# This script supports three operations:
#
# 1. Create a new branch from the develop branch.
# 2. Update the current branch by merging changes from develop and then push.
# 3. Delete a local branch (with an option to delete the remote branch too).
#
# Usage: Run the script from your repository root.
# ------------------------------------

# Function to create a new branch from develop
create_branch() {
    echo "=== Create New Branch ==="
    echo "Select branch type:"

    # List branch types; modify the array if needed.
    branch_types=("feature" "bugfix" "release" "hotfix")
    PS3="Choose branch type (enter number): "
    select type in "${branch_types[@]}"; do
        if [[ -n "$type" ]]; then
            branch_type="$type"
            break
        else
            echo "Invalid selection. Try again."
        fi
    done

    # Prompt for branch name
    read -p "Enter branch name (e.g., my-new-feature): " branch_name
    full_branch="${branch_type}-${branch_name}"

    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$full_branch"; then
        echo "Error: Branch '$full_branch' already exists."
        return
    fi

    # Switch to develop and pull the latest changes
    echo "Checking out 'develop' branch..."
    git checkout develop || { echo "Error: Cannot checkout develop"; exit 1; }
    echo "Pulling latest changes from origin/develop..."
    git pull origin develop || { echo "Error: Failed to pull develop"; exit 1; }

    # Create and switch to the new branch
    echo "Creating new branch: $full_branch"
    git checkout -b "$full_branch" || { echo "Error: Failed to create branch"; exit 1; }
    echo "Branch '$full_branch' created successfully."
}

# Function to update the current branch with changes from develop and push it
update_branch() {
    echo "=== Update Current Branch with Develop ==="
    # Determine the current branch name
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "Current branch is: $current_branch"

    # Confirm before proceeding
    read -p "Merge changes from 'develop' into '$current_branch' and push? [y/n]: " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        # Add all changes and commit before pulling from develop
        echo "Staging all changes..."
        git add -A || { echo "Error: Failed to stage changes"; exit 1; }

        # Prompt for commit message
        read -p "Enter commit message for the changes: " commit_message
        git commit -m "$commit_message" || { echo "Error: Commit failed"; exit 1; }

        # Update develop branch
        echo "Switching to 'develop' branch..."
        git checkout develop || { echo "Error: Cannot checkout develop"; exit 1; }
        echo "Pulling latest changes from origin/develop..."
        git pull origin develop || { echo "Error: Failed to pull develop"; exit 1; }

        # Merge develop into the current branch
        echo "Switching back to '$current_branch'..."
        git checkout "$current_branch" || { echo "Error: Cannot checkout $current_branch"; exit 1; }
        echo "Merging 'develop' into '$current_branch'..."
        git merge develop || { echo "Merge conflicts detected. Please resolve them manually."; exit 1; }

        # Push the updated branch to remote
        echo "Pushing '$current_branch' to remote..."
        git push origin "$current_branch" || { echo "Error: Failed to push branch"; exit 1; }
        echo "Branch '$current_branch' has been updated and pushed."
    else
        echo "Update canceled."
    fi
}

# Function to delete a local branch (with optional remote deletion)
delete_branch() {
    echo "=== Delete a Branch ==="

    # Get current branch name to prevent deletion of the branch you're on
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "You are currently on branch: $current_branch"

    # Gather local branches excluding the current branch
    local_branches=()
    while IFS= read -r line; do
        # Remove any leading '*' or whitespace
        branch=$(echo "$line" | sed 's/^[* ]*//')
        if [ "$branch" != "$current_branch" ]; then
            local_branches+=("$branch")
        fi
    done < <(git branch)

    if [ ${#local_branches[@]} -eq 0 ]; then
        echo "No other local branches available to delete."
        return
    fi

    echo "Select a branch to delete:"
    PS3="Choose branch to delete (enter number): "
    select branch in "${local_branches[@]}"; do
        if [ -n "$branch" ]; then
            read -p "Are you sure you want to delete the branch '$branch'? This action cannot be undone. [y/n]: " confirm_delete
            if [[ "$confirm_delete" =~ ^[Yy]$ ]]; then
                # Attempt to delete the branch normally
                git branch -d "$branch" 2>/dev/null
                if [ $? -ne 0 ]; then
                    echo "Branch deletion failed (it might not be fully merged)."
                    read -p "Do you want to force delete the branch '$branch'? [y/n]: " force_delete
                    if [[ "$force_delete" =~ ^[Yy]$ ]]; then
                        echo "WARNING: Force-deleting a branch can lead to data loss!"
                        git branch -D "$branch" || { echo "Error: Force deletion failed."; exit 1; }
                        echo "Branch '$branch' force deleted locally."
                    else
                        echo "Skipping deletion of branch '$branch'."
                        break
                    fi
                else
                    echo "Branch '$branch' deleted locally."
                fi

                # Optionally delete the remote branch
                read -p "Do you also want to delete the remote branch 'origin/$branch'? [y/n]: " delete_remote
                if [[ "$delete_remote" =~ ^[Yy]$ ]]; then
                    git push origin --delete "$branch"
                    if [ $? -eq 0 ]; then
                        echo "Remote branch 'origin/$branch' deleted successfully."
                    else
                        echo "Failed to delete remote branch 'origin/$branch'."
                    fi
                fi
            else
                echo "Deletion canceled for branch '$branch'."
            fi
            break
        else
            echo "Invalid selection. Please try again."
        fi
    done
}

# Main interactive menu
echo "=== Git Flow Interactive Script ==="
PS3="Select an option (enter number): "
options=("Create New Branch" "Update Current Branch with Develop" "Delete Branch" "Exit")
select opt in "${options[@]}"; do
    case "$REPLY" in
        1)
            create_branch
            break
            ;;
        2)
            update_branch
            break
            ;;
        3)
            delete_branch
            break
            ;;
        4)
            echo "Exiting."
            break
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
done
