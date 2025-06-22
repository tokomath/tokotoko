import Image from "next/image";
import DynamicIframe from "@/compornents/DynamicIframe";
import { Box } from "@mui/material";

const InsertFrame = ({ insertType,insertContent }: { insertType: string , insertContent: string}) => {
    let returnDOM : React.JSX.Element = <></>;
    if(insertContent == "")
        return(<></>)
    
    switch(insertType)
    {
        case "Image":
        returnDOM = 
        <Box  sx={{
            width: "100%",
            maxheight: "50vh",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid gray"
        }}>
            <Image src={insertContent} alt={"Picture"} width={640} height={480}
            style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            }}/>
        </Box>
        break;
        case "HTML":
        returnDOM = 
        <Box>
            <DynamicIframe srcDoc={insertContent}/>
        </Box>;
        break;
    }
    return (
        <>
            {returnDOM}
        </>
    );
}


export default InsertFrame;