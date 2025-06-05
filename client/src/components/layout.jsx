import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Button } from '@mui/material';
import {Link} from "@toolpad/core/internal"

import Stack from '@mui/material/Stack';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import accountButton from "./userButton"
import landingPage from '../pages/landingPage';



function botao(){
    return(
        <Button>OLA</Button>
    );
}
function sidebarFooter({ mini }) {
  return (
    <Typography
      variant="caption"
      sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
    >
      {mini ? '© TRIINL' : `© ${new Date().getFullYear()} TRIINL`}
    </Typography>
  );
}
function CustomAppTitle() {
  return (
      <Link href={'/'} style={{textDecoration:"none", color: "inherit"}}>
          <Stack direction="row" alignItems="center" spacing={2}>
              <AutoStoriesIcon fontSize="large" color="primary" />
              <Typography variant="h6">TRIINL</Typography>
          </Stack>
      </Link>
  );
}
export default function Layout() {
  return (
    <DashboardLayout slots={{appTitle:CustomAppTitle,sidebarFooter:sidebarFooter,toolbarAccount:accountButton}}>
      <Outlet />
    </DashboardLayout>
  );
}