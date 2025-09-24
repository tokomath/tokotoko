import { Tab, Tabs, Box, Card, CardContent, Typography, CardActionArea, Grid } from "@mui/material";
import dayjs from "dayjs";
import { Test, Class } from "@prisma/client";

import YAML from 'yaml'
const msg_yaml = require("../msg-ja.yaml") as string
const msg = YAML.parse(msg_yaml)

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
    if (Math.abs(diffHour) > 24) diffstr = `${diffDay + msg.DAY}`;
    else if (Math.abs(diffMin) > 59) diffstr = `${diffHour + msg.HOUR}`;
    else if (Math.abs(diffSec) > 59) diffstr = `${diffMin + msg.MINUTE}`;
    else diffstr = `${diffSec + msg.SECOND}`;

    diffstr = diffSec > 0 ? `${msg.REST_OF + diffstr}` : `${diffstr.replace("-", "") + msg.BEFORE}`;

    let diffColor = "black";
    let cardsxprop = {
        boxShadow: "2px 2px rgba(0,0,0,0.2)",
        fontWeight:"meduim"
    };
    let submitstatus = msg.NOT_SUBMITTED;
    if (submitted) {
      cardsxprop.boxShadow = "2px 2px rgba(0,200,64,0.4)";
      submitstatus = msg.SUBMITTED
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
                { msg.START + " : " + test.test.startDate.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                { msg.END + " : " + test.test.endDate.toLocaleString()}
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