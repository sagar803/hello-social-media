import { Box } from '@mui/material';
import { styled } from '@mui/system';

// If you are using CSS as a component we use styled component. 
const FlexBetween  = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
})

export default FlexBetween;