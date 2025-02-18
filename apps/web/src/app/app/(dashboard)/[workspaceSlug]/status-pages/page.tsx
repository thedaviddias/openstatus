import * as React from "react";

import { allPlans } from "@openstatus/plans";

import { Container } from "@/components/dashboard/container";
import { Header } from "@/components/dashboard/header";
import { Limit } from "@/components/dashboard/limit";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { ActionButton } from "./_components/action-button";
import { CreateForm } from "./_components/create-form";
import { EmptyState } from "./_components/empty-state";

const limit = allPlans.free.limits["status-pages"];

export const revalidate = 300; // revalidate this page every 5 minutes

export default async function Page({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const pages = await api.page.getPagesByWorkspace.query({
    workspaceSlug: params.workspaceSlug,
  });
  const monitors = await api.monitor.getMonitorsByWorkspace.query({
    workspaceSlug: params.workspaceSlug,
  });

  const isLimit = (pages?.length || 0) >= limit;
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <Header
        title="Status Page"
        description="Overview of all your status page."
      >
        <CreateForm
          workspaceSlug={params.workspaceSlug}
          allMonitors={monitors}
          disabled={isLimit || !Boolean(monitors)}
        />
      </Header>
      {Boolean(pages?.length) ? (
        pages?.map((page, index) => (
          <Container
            key={index}
            title={page.title}
            description={page.description}
          >
            <ActionButton
              page={{
                ...page,
                workspaceSlug: params.workspaceSlug,
                monitors: page.monitorsToPages.map(({ monitor }) => monitor.id),
              }}
              allMonitors={monitors}
            />
            <dl className="[&_dt]:text-muted-foreground grid gap-2 [&>*]:text-sm [&_dt]:font-light">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <dt>Slug</dt>
                <dd className="font-mono">{page.slug}</dd>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <dt>Monitors</dt>
                <dd className="flex flex-wrap justify-end gap-2">
                  {page.monitorsToPages.map(
                    ({ monitor: { id, name, active } }, i) => (
                      <Badge key={id} variant={active ? "default" : "outline"}>
                        {name}
                        <span
                          className={cn(
                            "ml-1 inline-block h-1.5 w-1.5 rounded-full",
                            active ? "bg-green-500" : "bg-red-500",
                          )}
                        />
                      </Badge>
                    ),
                  )}
                </dd>
              </div>
            </dl>
          </Container>
        ))
      ) : (
        <EmptyState workspaceId={params.workspaceSlug} allMonitors={monitors} />
      )}
      {isLimit ? <Limit /> : null}
    </div>
  );
}
