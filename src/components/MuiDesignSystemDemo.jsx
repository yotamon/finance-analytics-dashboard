import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  useTheme,
  Fab,
} from "@mui/material";
import PropTypes from "prop-types";

// Material UI Icons
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Send as SendIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

function MuiDesignSystemDemo() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [radioValue, setRadioValue] = useState("option1");
  const [selectValue, setSelectValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
  };

  const handleSelectChange = (event) => {
    setSelectValue(event.target.value);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary">
        Material UI Component Showcase
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates the various Material UI components available for use in your
        application.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="material ui demos">
          <Tab label="Basic Components" />
          <Tab label="Form Elements" />
          <Tab label="Complex Components" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>
          Basic Components
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Buttons
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button variant="contained">Primary</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="secondary">
                  Secondary
                </Button>
                <Button variant="contained" color="success">
                  Success
                </Button>
                <Button variant="contained" color="error">
                  Error
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Typography
              </Typography>
              <Typography variant="h1" gutterBottom>
                h1 Heading
              </Typography>
              <Typography variant="h2" gutterBottom>
                h2 Heading
              </Typography>
              <Typography variant="h3" gutterBottom>
                h3 Heading
              </Typography>
              <Typography variant="h4" gutterBottom>
                h4 Heading
              </Typography>
              <Typography variant="h5" gutterBottom>
                h5 Heading
              </Typography>
              <Typography variant="h6" gutterBottom>
                h6 Heading
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Subtitle 1
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Subtitle 2
              </Typography>
              <Typography variant="body1" gutterBottom>
                Body 1 text. Lorem ipsum dolor sit amet.
              </Typography>
              <Typography variant="body2">Body 2 text. Lorem ipsum dolor sit amet.</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Chips & Badges
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label="Basic" />
                <Chip label="Primary" color="primary" />
                <Chip label="Success" color="success" />
                <Chip label="With Icon" icon={<FavoriteIcon />} color="secondary" />
                <Chip label="Deletable" onDelete={() => {}} />
              </Stack>

              <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                <Badge badgeContent={4} color="primary">
                  <MailIcon />
                </Badge>
                <Badge badgeContent={100} color="secondary" max={99}>
                  <MailIcon />
                </Badge>
                <Badge color="success" variant="dot">
                  <MailIcon />
                </Badge>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Alerts
              </Typography>
              <Stack spacing={2}>
                <Alert severity="error">This is an error alert — check it out!</Alert>
                <Alert severity="warning">This is a warning alert — check it out!</Alert>
                <Alert severity="info">This is an info alert — check it out!</Alert>
                <Alert severity="success">This is a success alert — check it out!</Alert>
                <Alert severity="success" variant="outlined">
                  This is an outlined alert
                </Alert>
                <Alert severity="info" variant="filled">
                  This is a filled alert
                </Alert>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Form Elements
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Text Fields
              </Typography>
              <Stack spacing={3}>
                <TextField label="Standard" variant="outlined" fullWidth />
                <TextField
                  label="With Helper Text"
                  helperText="Some helper text"
                  variant="outlined"
                  fullWidth
                />
                <TextField label="Password" type="password" variant="outlined" fullWidth />
                <TextField label="Disabled" disabled variant="outlined" fullWidth />
                <TextField
                  label="Error"
                  error
                  helperText="Error message"
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Multiline"
                  multiline
                  rows={4}
                  placeholder="Type your message here"
                  variant="outlined"
                  fullWidth
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selection Controls
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Switches
                </Typography>
                <FormControlLabel control={<Switch defaultChecked />} label="Enabled" />
                <FormControlLabel control={<Switch />} label="Disabled" />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Radio Buttons
                </Typography>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Options</FormLabel>
                  <RadioGroup
                    aria-label="options"
                    name="radio-buttons-group"
                    value={radioValue}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                    <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                    <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Slider
                </Typography>
                <Typography id="slider-label" gutterBottom>
                  Value: {sliderValue}
                </Typography>
                <Slider
                  value={sliderValue}
                  onChange={handleSliderChange}
                  aria-labelledby="slider-label"
                  valueLabelDisplay="auto"
                  marks
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dropdown & Select
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="demo-simple-select-label">Selection</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectValue}
                  label="Selection"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" onClick={handleClick} startIcon={<InfoIcon />}>
                Show Snackbar
              </Button>

              <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message="This is a snackbar message"
                action={
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>
          Complex Components
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://source.unsplash.com/random/800x400/?finance"
                alt="Random finance image"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Card Title
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cards are surfaces that display content and actions on a single topic. They should
                  be easy to scan for relevant and actionable information.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<FavoriteIcon />}>
                  Like
                </Button>
                <Button size="small" startIcon={<ShareIcon />}>
                  Share
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="List Item Title"
                    secondary="Secondary text describing this list item in more detail"
                  />
                </ListItem>
                <Divider />
                <ListItem button>
                  <ListItemIcon>
                    <FavoriteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Clickable List Item"
                    secondary="You can click this entire list item"
                  />
                </ListItem>
                <Divider />
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <MailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="List Item with Action"
                    secondary="This list item has an action button"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Avatar & Tooltip
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Tooltip title="User Profile">
                  <Avatar>H</Avatar>
                </Tooltip>
                <Tooltip title="Jane Smith">
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>JS</Avatar>
                </Tooltip>
                <Tooltip title="User Profile">
                  <Avatar src="https://source.unsplash.com/random/200x200/?portrait" />
                </Tooltip>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title="Add to favorites">
                  <IconButton aria-label="add to favorites">
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton aria-label="share">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add">
                  <Fab color="primary" aria-label="add" size="small">
                    <AddIcon />
                  </Fab>
                </Tooltip>
                <Tooltip title="Send Message">
                  <Button variant="contained" endIcon={<SendIcon />}>
                    Send
                  </Button>
                </Tooltip>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}

export default MuiDesignSystemDemo;
