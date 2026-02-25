import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Program } from "@/types";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link to={`/program/${program.id}`} className="block">
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {program.code}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-sm leading-snug">{program.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">{program.group_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
