
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
    export const LoadingSpine = () => {

        return<>
        <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        </>
    }