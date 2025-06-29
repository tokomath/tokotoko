import { Tab, Tabs, Box, Card, CardContent, Typography, CardActionArea, Grid } from "@mui/material";
import dayjs from "dayjs";
import { Test, Class } from "@prisma/client";


interface TestInterface {
  test: Test;
  class: Class;
}

interface TestWithSubmitStatus extends TestInterface {
  submitted: boolean;
}

export function StudentTestCard({ test }: { test: TestWithSubmitStatus }){
    const submitted = test.submitted;

    const nowDate = dayjs();
    const deadline = dayjs(test.test.endDate);
    const diffSec = deadline.diff(nowDate, "seconds");
    const diffMin = deadline.diff(nowDate, "minutes");
    const diffHour = deadline.diff(nowDate, "hours");
    const diffDay = deadline.diff(nowDate, "days");

    let diffstr = "";
    if (Math.abs(diffHour) > 24) diffstr = `${diffDay}日`;
    else if (Math.abs(diffMin) > 59) diffstr = `${diffHour}時間`;
    else if (Math.abs(diffSec) > 59) diffstr = `${diffMin}分`;
    else diffstr = `${diffSec}秒`;

    diffstr = diffSec > 0 ? `あと${diffstr}` : `${diffstr.replace("-", "")}前`;

    let diffColor = "black";
    let cardsxprop = {
        boxShadow: "2px 2px rgba(0,0,0,0.2)",
        fontWeight:"meduim"
    };
    let submitstatus = "未提出";
    if (submitted) {
      cardsxprop.boxShadow = "2px 2px rgba(0,200,64,0.4)";
      submitstatus = "提出済み"
    }
    if (!submitted && diffMin < 0) {
      diffColor = "red";
      cardsxprop.boxShadow = "2px 2px rgba(255,0,0,0.4)";
      cardsxprop.fontWeight = "bold"
    }

    return (
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={cardsxprop}>
          <CardActionArea onClick={() => (location.href = `/solve/${test.test.id}`)}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {test.class.name}
              </Typography>
              <Typography gutterBottom variant="h5" component="div">
                {test.test.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"Start: " + test.test.startDate.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"End : " + test.test.endDate.toLocaleString()}
              </Typography>
              <Typography variant="body2" color={diffColor}>
                {submitstatus+" "+diffstr}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };