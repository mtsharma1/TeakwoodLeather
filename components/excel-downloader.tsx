"use client"
import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { downloadExcel } from "@/lib/utils";

export const ExcelDownloader = ({
  data,
  filename,
}: {
  data: { [key: string]: string }[]
  filename: string,
}) => {
  return (
    <Button
      size="icon"
      onClick={() => downloadExcel(data, filename)}
    >
      <DownloadIcon size={18} />
    </Button>
  );
};