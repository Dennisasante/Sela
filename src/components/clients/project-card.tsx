"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical } from "lucide-react";
import { updateProjectStatus, deleteProject } from "@/app/(app)/income/actions";
import { formatMoney } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import { MilestoneList } from "@/components/clients/milestone-list";
import type { ProjectBalance } from "@/lib/data/income";
import type { Account, ProjectMilestone, ProjectStatus } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectCard({
  project,
  milestones,
  accounts,
}: {
  project: ProjectBalance;
  milestones: ProjectMilestone[];
  accounts: Account[];
}) {
  const [pending, startTransition] = useTransition();
  const balance = project.totalAmount - project.paidToDate;

  function handleStatusChange(status: ProjectStatus) {
    startTransition(async () => {
      try {
        await updateProjectStatus(project.id, status);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{project.title}</p>
            {project.description && (
              <p className="text-xs text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant={
                project.status === "completed"
                  ? "success"
                  : project.status === "cancelled"
                    ? "destructive"
                    : "info"
              }
              className="capitalize"
            >
              {project.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={withDataSlot(
                  <Button variant="ghost" size="icon" aria-label="Project actions">
                    <MoreVertical className="size-4" />
                  </Button>,
                  "dropdown-menu-trigger"
                )}
              />
              <DropdownMenuContent align="end">
                {project.status !== "completed" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                    Mark completed
                  </DropdownMenuItem>
                )}
                {project.status !== "active" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                    Mark active
                  </DropdownMenuItem>
                )}
                {project.status !== "cancelled" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
                    Cancel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(100, (project.paidToDate / project.totalAmount) * 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Paid {formatMoney(project.paidToDate, project.currency)} of{" "}
            {formatMoney(project.totalAmount, project.currency)}
          </span>
          <span className="font-medium text-foreground">
            {formatMoney(balance, project.currency)} left
          </span>
        </div>

        {project.projectExpenses > 0 && (
          <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/50 p-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground">Received</p>
              <p className="font-semibold">{formatMoney(project.paidToDate, project.currency)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expenses</p>
              <p className="font-semibold text-destructive">
                {formatMoney(project.projectExpenses, project.currency)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Net</p>
              <p className="font-semibold">{formatMoney(project.netReceived, project.currency)}</p>
            </div>
          </div>
        )}

        <MilestoneList projectId={project.id} milestones={milestones} accounts={accounts} />
      </CardContent>
    </Card>
  );
}
