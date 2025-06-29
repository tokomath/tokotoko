"use client";

import React, { memo, useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";
import SchoolIcon from "@mui/icons-material/School";
import "katex/dist/katex.min.css";
import { TeacherGuard } from "@/lib/guard";
import { TeacherClassCards } from "@/compornents/TeacherClassList";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{
        display: value === index ? "block" : "none",
        height: "100%",
      }}
      {...other}
    >
      <Box sx={{ p: 3 }}>{children}</Box>
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const ClassCard = memo(() => {
  const router = useRouter();
  const createClass = useCallback(() => router.push("/teacher/createClass"), [router]);
  const manageClass = useCallback(() => router.push("/teacher/manageClass"), [router]);
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">クラス</Typography>
      </CardContent>
      <CardActions>
        <Button size="large" onClick={createClass}>作成</Button>
        <Button size="large" onClick={manageClass}>管理</Button>
      </CardActions>
    </Card>
  );
});
ClassCard.displayName = "ClassCard";

export default function MyPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [value, setValue] = useState(0);
  const handleChange = (_: React.SyntheticEvent, newValue: number) => setValue(newValue);

  return (
    <TeacherGuard>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>


        <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
          <Tabs
            orientation="vertical"
            value={value}
            onChange={handleChange}
            aria-label="Menu"
          >
            <Tab label="Class" icon={<ClassIcon />} {...a11yProps(0)} />
            <Tab label="Test" icon={<SchoolIcon />} {...a11yProps(1)} />
          </Tabs>

          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <TabPanel value={value} index={0}>
              <Box display="flex" flexDirection="column" gap={3}>
                <ClassCard />
                <Typography variant="h5">クラス一覧</Typography>
                <TeacherClassCards />
              </Box>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Box p={2} />
            </TabPanel>
          </Box>
        </Box>
      </Box>
    </TeacherGuard>
  );
}
