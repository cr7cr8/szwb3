import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';
import axios from "axios";
import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";
import ContentPerson from "./ContentPerson";

import MainPage from "./MainPage";

import {
  BrowserRouter, Route, Routes, useRoutes, Link, useParams, matchPath, useLocation, useNavigate, Outlet

} from "react-router-dom";


import {
  Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Button, Chip, Avatar, CssBaseline, Typography, Collapse, Switch, Divider,
  Slider, TextField
} from '@mui/material';

import { Crop, DoneRounded, Close, AddCircleOutline, AddAPhoto } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';

import SettingsIcon from '@mui/icons-material/Settings';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


import multiavatar from '@multiavatar/multiavatar'
import { url, toPreHtml, hexToRGB, hexToRGB2, colorArr, colorIndexArr, getColor } from "./config";

import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';
import useAppContext from './useAppContext';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import TextareaAutosize from '@mui/material/TextareaAutosize';

export const AppContext = createContext()

function App() {


  const [postArr, setPostArr] = useState([])
  //const [userName, setUserName] = useState("User" + String(Math.random()).substring(3, 6))
  const [userName, setUserName] = useState(localStorage.getItem("userName") || ("User" + String(Math.random()).substring(3, 6)))
  const [userColor, setUserColor] = useState()


  const [userAvatarUrl, setUserAvatarUrl] = useState("data:image/svg+xml;base64," + btoa(multiavatar(userName)))

  const [clickFn, setClickFn] = useState(null)



  const [savedPostArr, setSavedPostArr] = useState()

  const [needUpdateArr, setNeedUpdateArr] = useState([])
  const [needReduceArr, setNeedReduceArr] = useState([])

  const [avatarNameArr, setAvatarNameArr] = useState([])
  const [userInfoArr, setUserInfoArr] = useState([])


  const [random, setRandom] = useState(Math.random())

  useEffect(function () {
    // axios.get(`${url}/api/user/getAllAvatarName`).then(response => {
    //   setAvatarNameArr(response.data)
    // })

    axios.get(`${url}/api/user/getAllUser`).then(response => {
      // setAvatarNameArr(response.data)
      const arr = response.data.filter(userItem => {
        return userItem.hasAvatar
      }).map(userItem => userItem.userName)
      setAvatarNameArr(arr)

      const colorName = response.data.find(userItem => userItem.userName === userName)?.colorName

      colorName && setUserColor(colorName)
      setUserInfoArr(response.data)

    })


    if (!localStorage.getItem("userName")) {

      axios.post(`${url}/api/user/regist`, { userName }).then(response => {
        Boolean(response.data)
          ? localStorage.setItem("userName", userName)
          : setUserName("User" + String(Math.random()).substring(3, 6))
      })
    }

  }, [userName])

  useEffect(function () {
    if (avatarNameArr.includes(userName)) {
      setUserAvatarUrl(`${url}/api/user/downloadAvatar/${userName}/${random}`)
    }
  }, [avatarNameArr])

  useEffect(function () {



  }, [userColor])


  return (
    <ThemeContextProvider>
      <AppContext.Provider value={{
        userName, setUserName, clickFn, setClickFn,
        userColor, setUserColor,

        savedPostArr, setSavedPostArr,
        postArr, setPostArr,
        needUpdateArr, setNeedUpdateArr,
        needReduceArr, setNeedReduceArr,
        userAvatarUrl, setUserAvatarUrl,
        avatarNameArr, setAvatarNameArr,
        userInfoArr, setUserInfoArr,
        random, setRandom,
      }}>

        <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"} >
          <CssBaseline />

          <Routes>
            <Route path="/" element={<><BarMain /><MainPage /></>} />
            <Route path="/person/*" element={
              <>
                <Routes>
                  <Route path=":personName" element={<><BarPerson /><ContentPerson /></>} />
                </Routes>
              </>
            } />
          </Routes>

        </Container>
      </AppContext.Provider>
    </ThemeContextProvider>



  );
}

export default App;

function BarMain({ ...props }) {

  const theme = useTheme()
  const { userName, setUserName, clickFn, userAvatarUrl, setUserAvatarUrl, random, setRandom, userColor, setUserColor, userInfoArr, setPostArr } = useAppContext()
  const bgcolor = getColor({ name: userName, userName, userInfoArr, userColor, theme })
  const [settingOn, setSettingOn] = useState(false)
  const [open, setOpen] = useState(false)

  const [newName, setNewName] = useState(userName)
  const nameInputRef = useRef()
  const [nameBtn, setNameBtn] = useState(true)

  return (
    <Paper sx={{
      bgcolor: bgcolor,// theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6),
      padding: "4px", my: "8px", mx: "4px", display: "flex", alignItems: "flex-end",
      justifyContent: "center",
    }}>
      <Box sx={{
        padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content",// opacity: isMainPage ? 1 : 0,
        transition: "transfrom, 300ms",
      }}>
        <Avatar src={userAvatarUrl} sx={{ width: "2.4rem", height: "2.4rem", "&:hover": { cursor: "pointer", opacity: "0.8" } }}
          onClick={function () { setOpen(true) }}
        />
      </Box>

      <Box sx={{
        //bgcolor: "background.default",
        width: "60%", maxWidth: "600px",
        color: theme.palette.text.secondary,
        //   bgcolor: "pink",
        transition: "all 300ms",
        mx: "8px",
      }}>
        <Box sx={{
          bgcolor: "background.default", borderRadius: "8px", width: "100%", maxWidth: "600px",
          color: theme.palette.text.secondary, px: "8px",
          height: "calc( 2.4rem + 4px )", display: "flex", alignItems: "center",
          marginBottom: settingOn ? "8px" : "2px"
        }}
          onClick={clickFn}
        >
          <Typography sx={{ fontSize: theme.sizeObj, color: theme.palette.text.default, display: "inline-block" }}>{userName}</Typography>
        </Box>

        <Collapse unmountOnExit={false} in={settingOn}>
          <Box direction="row" spacing={2} sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>


            <RadioGroup
              row
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={theme.sizeObj[0]}
              onChange={function (e) {
                const sizeValue = e.target.value

                theme.setSizeObj({ xs: sizeValue, sm: sizeValue, md: sizeValue, lg: sizeValue, xl: sizeValue })
              }}
            >
              <FormControlLabel value="1rem" control={<Radio />} label="" sx={{ transform: "scale(0.8)", "& span": { fontSize: "1rem" } }} checked={Boolean(theme.sizeObj.xs === "1rem")} />
              <FormControlLabel value="1.25rem" control={<Radio />} label="" sx={{ transform: "scale(0.9)", "& span": { fontSize: "1.25rem" } }} checked={theme.sizeObj.sm === "1.25rem"} />
              <FormControlLabel value="1.5rem" control={<Radio />} label="" sx={{ transform: "scale(1)", "& span": { fontSize: "1.5rem" } }} checked={theme.sizeObj.md === "1.5rem"} />
              <FormControlLabel value="1.75rem" control={<Radio />} label="" sx={{ transform: "scale(1.1)", "& span": { fontSize: "1.75rem" } }} checked={theme.sizeObj.lg === "1.75rem"} />
              <FormControlLabel value="2rem" control={<Radio />} label="" sx={{ transform: "scale(1.25)", "& span": { fontSize: "2rem" } }} checked={theme.sizeObj.xl === "2rem"} />
            </RadioGroup>

            <Switch
              //   sx={{ position: "absolute", right: -10 }}
              checked={!theme.isLight}
              onChange={function (event) {
                event.target.checked
                  ? theme.setMode("dark")
                  : theme.setMode("light")
              }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%", gap: "4px", flexWrap: "wrap" }}>
            {colorArr.map((colorItem, index) => {

              return (
                <Box key={index} sx={{
                  width: "2.4rem", height: "2.4rem",
                  borderRadius: "1000px",
                  borderWidth: "2px", borderColor: theme.palette.background.default, borderStyle: "solid",
                  "&:hover": { transform: "scale(1.2)", cursor: "pointer" },
                  transition: "all 300ms", overflow: "hidden",
                }}
                  onClick={function () {
                    setUserColor(colorIndexArr[index])
                    axios.put(`${url}/api/user/changeColor`, { userName, colorName: colorIndexArr[index] }).then(response => {
                      //      console.log(response.data)
                    })
                  }}
                >
                  <Box sx={{
                    width: "100%", height: "100%", bgcolor: colorItem[500] //bgcolor: theme.isLight ? colorItem[100] : hexToRGB2(colorItem[500], 0.7) 
                  }}></Box>
                </Box>
              )


            })}

            <DoDisturbIcon
              onClick={function () {
                setUserColor(null)
                axios.put(`${url}/api/user/changeColor`, { userName, colorName: "" }).then(response => {
                  //      console.log(response.data)
                })
              }}
              sx={{
                width: "2.4rem", height: "2.4rem", "&:hover": { transform: "scale(1.2)", cursor: "pointer" },
                transition: "all 300ms", overflow: "hidden",
              }} fontSize='large' />
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <TextField label="New Name" variant="filled" sx={{ marginTop: "4px", "& input": { fontSize: theme.sizeObj, maxWidth: "200px" } }}
              value={newName}
              inputProps={{ maxLength: 10 }}
              ref={nameInputRef}
              onChange={function (e) {
                const text = e.target.value
                const regx = /^([\w_\[\u4E00-\u9FCA\]]{2,10})$/g

                setNameBtn(pre => {
                  if (userName === text) { return true }
                  return !Boolean(text.match(regx))

                })
                setNewName(e.target.value)
              }}
            />
            <Button disabled={nameBtn} variant='outlined' sx={{ mx: "4px" }}
              onClick={function (e) {
                setNameBtn(true)
                axios.get(`${url}/api/user/isUserThere/${newName}`)
                  .then(response => {
                    return response.data
                  })
                  .then(isThere => {
                    if (!isThere) {
                      return axios.put(`${url}/api/user/updateUserName`, { userName, newName })
                    }
                    else return false
                  })
                  .then(result => {

                    if (result) {
                      // setPostArr([])
                      // setUserName(newName)
                      localStorage.setItem("userName", newName)
                      window.location.reload();
                    }
                    else {
                      alert("name " + newName + " was taken")
                      setNameBtn(false)
                    }
                    //  setNameBtn(false)
                  })


              }}
            >Change</Button>
          </Box>
        </Collapse>




      </Box>

      <Box sx={{
        padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content"

      }}>
        <Avatar sx={{
          width: "2.4rem", height: "2.4rem",
          // bgcolor: theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6),
          // "&:hover": { bgcolor: avatarColor, cursor: "pointer" }
          bgcolor: bgcolor,
          "&:hover": { bgcolor: theme.palette.background.default, cursor: "pointer" }
        }}
          onClick={function () {
            // window.open("/person", '_blank')
            // Boolean(clickFn) ? navigate(`/person/${userName}`) : navigate(`/`)
            setSettingOn(pre => !pre)
          }}
        >
          <SettingsIcon sx={{ color: theme.palette.background.default, "&:hover": { color: bgcolor, } }} fontSize='large' />
        </Avatar>
      </Box>

      <Dialog
        onBackdropClick={function () { setOpen(false) }}
        fullWidth={true}
        //  fullScreen={true}
        open={open}
        onClose={function () { }}
        scroll={"body"}
        sx={{ "& .MuiDialog-paper": { overflowY: "auto", width: "300px", height: "300px" } }}
      >

        <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <ImageAdjuster setOpen={setOpen} />
        </Box>

      </Dialog>


    </Paper >
  )
}


function BarPerson() {
  const theme = useTheme()
  const { userName, clickFn, userAvatarUrl, setUserAvatarUrl, avatarNameArr, random, userInfoArr, userColor, } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const isMainPage = Boolean(matchPath("/", location.pathname))
  const { personName } = useParams()

  const bgcolor = getColor({ name: personName, userName, userInfoArr, userColor, theme })
  const [newDescription, setNewDescription] = useState("")
  const userAvatarSrc = userName === personName
    ? userAvatarUrl
    : avatarNameArr.includes(personName)
      ? `${url}/api/user/downloadAvatar/${personName}/${random}`
      : "data:image/svg+xml;base64," + btoa(multiavatar(personName))

  const avatarString = multiavatar(personName)
  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]
  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
  }

  const banerRef = useRef()
  const [height, setHeight] = useState(10)
  const [imageUrl, setImageUrl] = useState()
  const [open, setOpen] = useState(false)

  useEffect(function () {


    const resizeObserver = new ResizeObserver(entries => {
      //  console.log(entries[0].contentRect.width)
      setHeight(entries[0].contentRect.width / 6)
    })

    resizeObserver.observe(banerRef.current)


    axios.get(`${url}/api/user/userDescription${personName}`).then(response => {
      setNewDescription(response.data)
    })

    return function () { resizeObserver.disconnect() }




  }, [])

  //  useEffect(function () { console.log(imageUrl) }, [imageUrl])

  return (
    <>
      <Box sx={{
        //    bgcolor:"lightsalmon", 
        //     padding: "4px",
        my: "8px", mx: "4px",
        //display: "flex",
        // alignItems: "center",
        // justifyContent: "flex-end",
        position: "relative",
        // flexDirection: "column",
        maxHeight: 1.5 * height,
        overflow: "visible",

        //  height: height 
      }}>



        <Box
          ref={banerRef}
          sx={{
            width: "100%",// maxWidth: "600px",
            bgcolor,
            // bgcolor: "pink",
            // overflow: "hidden",
            height,
            position: "relative",
            overflow: "visible",
            boxShadow: 3,
            display: "flex",
            alignItems: "flex-end",
            backgroundSize: "cover",
            ...!open && { backgroundImage: `url(${imageUrl || `${url}/api/user/downloadBanerPic/${personName}/${random}`})` },
          }}>
          {open && <ImageAdjuster2 setOpen={setOpen} open={open} imageUrl={imageUrl} setImageUrl={setImageUrl} />}


          {personName === userName && <IconButton size="small" sx={{
            transform: { xs: "scale(1.2)", sx: "scale(1.2)", md: "scale(1.5)", lg: "scale(1.5)", xl: "scale(1.5)" },
            display: "block",
            bottom: 0,
            right: 0,
            position: "absolute",
            zIndex: 300,
            transform: "translateY(100%)",
          }}
            onClick={function () { setOpen(pre => !pre) }}
          >
            {open
              ? <Close fontSize='large' sx={{ color: theme.palette.text.secondary }} />
              : <SettingsIcon fontSize='large' sx={{ color: theme.palette.text.secondary }} />
            }
          </IconButton>
          }
        </Box>



        <Grid container
          direction="row"
          justifyContent="center"
          // alignItems="flex-end"
          spacing={0}
          sx={{
            //   bgcolor: "rgba(122,122,122,0.5)",
            transform: "translateY(-50%)",
            //  top: "50%",
            height,
            zIndex: 200,
            //   top: "50%",
            overflow: "hidden",
            //  position: "absolute",
          }}
        >
          <Grid item xs={1} sm={1} md={1} lg={1} xl={1} sx={{
            //  bgcolor: "pink",
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <IconButton size="small" sx={{ transform: { xs: "scale(1.2)", sx: "scale(1.2)", md: "scale(1.5)", lg: "scale(1.5)", xl: "scale(1.5)" }, }}
              onClick={function () {

                navigate("/")

              }} >
              <ArrowBackIcon fontSize='large' sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
          </Grid>

          {/* <IconButton size="small" sx={{ postion:"absolute", transform: { xs: "scale(1.2)", sx: "scale(1.2)", md: "scale(1.5)", lg: "scale(1.5)", xl: "scale(1.5)" }, }}
            onClick={function () { }} >
            <ArrowBackIcon fontSize='large' sx={{ color: theme.palette.text.secondary }} />
          </IconButton> */}


          <Grid item xs={2} sm={2} md={2} lg={2} xl={2} sx={{
            position: "relative",
            transform: "translateX(-16px)",
            height,
          }}>
            <Avatar src={userAvatarSrc} sx={{
        
              width: height,
              height: height,
              borderWidth: "4px",
              borderColor: theme.palette.background.default,
              borderStyle: "solid",
              boxShadow: 3,
              transform: { xs: "scale(0.7)", sx: "scale(0.7)", md: "scale(0.7)", lg: "scale(0.7)", xl: "scale(0.7)" },
         
              ...open && { display: "none" },
           
            
            }}
            
            onClick={function(){
              alert("fff")
            }}
            />
          </Grid>

          <Grid item xs={9} sm={9} md={9} lg={9} xl={9} sx={{
            //  bgcolor: "rgba(156,124,12,0.5)", //height: height / 2, 
            // transform: "translateY(60%)"
            //   bgcolor: "lightblue",
            display: "flex", flexDirection: "column", justifyContent: "center",
            height,
            transform: "translateX(-16px)",
          }}>
            <Typography sx={{ fontSize: theme.sizeObj, height: "50%", display: "flex", alignItems: "flex-end", }}>{personName}</Typography>

            {!open
              ? <Typography sx={{ fontSize: theme.sizeObj, height: "50%", textOverflow: "ellipsis", overflow: "auto", }}>
                {newDescription}
              </Typography>
              :
              <>
                <TextField
                  value={newDescription}
                  onChange={function (e) { setNewDescription(e.target.value) }}
                  autoFocus sx={{ width: "80%", bgcolor: "pink", "& textarea": { fontSize: theme.sizeObj, height: "100%" + " !important" } }}
                  multiline
                />
                <Button sx={{ width: "80%" }} onClick={function () {
                  setOpen(false)
                  axios.post(`${url}/api/user/updateDescription`, { userName: personName, description: newDescription })


                }}>OK</Button>
              </>




              //<TextareaAutosize
              //style={{ fontSize: theme.sizeObj, }}
              //sx={{ fontSize: theme.sizeObj, width: "80%", "& input": { fontSize: theme.sizeObj, } }} 
              // />
            }
          </Grid>
        </Grid>

      </Box >




    </>
  )



}




function ImageAdjuster({ setOpen, ...props }) {

  const { userName, clickFn, userAvatarUrl, setUserAvatarUrl } = useAppContext()
  const [imageUrl, setImageUrl] = useState(userAvatarUrl)

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)


  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // const aspectArr = [1 / 1, 16 / 9, 1 / 1, 1 / 1, 16 / 9]

  const inputRef = useRef()
  function update(e) {
    e.stopPropagation()
    if (e.currentTarget.files[0].name.trim().match(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i)) {

      const file = URL.createObjectURL(e.currentTarget.files[0])
      setImageUrl(file)
    }
  }



  return (

    <>
      <input ref={inputRef} type="file" multiple={false} accept="image/*" style={{ display: "none" }}
        onClick={function (e) { e.currentTarget.value = null; }}
        onChange={update}
      />


      <IconButton sx={{
        fontSize: "2rem", width: "2.5rem", height: "2.5rem",
        position: "absolute", top: 8, left: 8,
        zIndex: 80,
        bgcolor: "rgba(255,255,255,0.3)"
      }}
        size="small"
        contentEditable={false} suppressContentEditableWarning={true}
        onClick={async function (e) {

          inputRef.current.click()

        }}
      >
        <AccountCircleOutlinedIcon fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />
      </IconButton>

      <IconButton sx={{
        fontSize: "2rem", width: "2.5rem", height: "2.5rem",
        position: "absolute", top: 8, right: 8,
        zIndex: 80,
        bgcolor: "rgba(255,255,255,0.3)"
      }}
        size="small"
        onClick={async function () {
          const croppedImage = await getCroppedImg(
            imageUrl,
            croppedAreaPixels,
            rotation,
          )
          setUserAvatarUrl(croppedImage)
          setOpen(false)
          setImageUrl(croppedImage)

          fetch(croppedImage)
            .then(file => {
              return file.blob()
            })
            .then(blobData => {

              const data = new FormData();

              data.append("file", new File([blobData], userName, { type: "image/jpeg" }))
              data.append('obj', JSON.stringify({ ownerName: userName }));

              return axios.post(`${url}/api/user/uploadAvatar`, data, {
                headers: { 'content-type': 'multipart/form-data' },
              }).then(response => {
                console.log(response.data)
              })

            })



        }}
      >
        <Crop fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />
      </IconButton >




      <Box sx={{ width: "100%", height: "100%", '& div[data-testid*="cropper"]': { borderRadius: "1000px" } }}>
        <Cropper image={imageUrl}  //"https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000"
          aspect={1}
          crop={crop}
          rotation={rotation}
          zoom={zoom}

          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </Box>

      <Slider
        size="medium"
        value={zoom}
        min={1}
        max={3}
        step={0.1}
        aria-labelledby="Zoom"
        //  classes={{ root: classes.slider }}
        onChange={(e, zoom) => setZoom(zoom)}
        sx={{
          //  padding: '22px 0px',
          //  marginLeft: "",
          marginLeft: "20px",
          marginRight: "20px",
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          my: "0",
          width: "85%",
          mx: "auto",
          color: "skyblue",

        }}
      />


    </>
  )

}


function ImageAdjuster2({ open, setOpen, imageUrl, setImageUrl, ...props }) {

  const { userName, clickFn, } = useAppContext()
  // const [imageUrl, setImageUrl] = useState(userAvatarUrl)

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)


  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // const aspectArr = [1 / 1, 16 / 9, 1 / 1, 1 / 1, 16 / 9]

  const inputRef = useRef()
  function update(e) {
    e.stopPropagation()
    if (e.currentTarget.files[0].name.trim().match(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i)) {
      const file = URL.createObjectURL(e.currentTarget.files[0])
      setImageUrl(file)
    }
  }



  return (

    <>
      <input ref={inputRef} type="file" multiple={false} accept="image/*" style={{ display: "none" }}
        onClick={function (e) { e.currentTarget.value = null; }}
        onChange={update}
      />


      <IconButton sx={{
        fontSize: "2rem", width: "2.5rem", height: "2.5rem",
        position: "absolute", top: 8, left: 8,
        zIndex: 80,
        bgcolor: "rgba(255,255,255,0.3)"
      }}
        size="small"
        contentEditable={false} suppressContentEditableWarning={true}
        onClick={async function (e) {

          inputRef.current.click()

        }}
      >
        <AddAPhoto fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />
      </IconButton>

      <IconButton sx={{
        fontSize: "2rem", width: "2.5rem", height: "2.5rem",
        position: "absolute", top: 8, right: 8,
        zIndex: 80,
        bgcolor: "rgba(255,255,255,0.3)"
      }}
        size="small"
        onClick={async function () {

          if (!imageUrl) return

          const croppedImage = await getCroppedImg(
            imageUrl,
            croppedAreaPixels,
            rotation,
          )

          setOpen(false)
          setImageUrl(croppedImage)

          fetch(croppedImage)
            .then(file => {
              return file.blob()
            })
            .then(blobData => {

              const data = new FormData();

              data.append("file", new File([blobData], userName, { type: "image/jpeg" }))
              data.append('obj', JSON.stringify({ ownerName: userName }));

              return axios.post(`${url}/api/user/uploadBanerPic`, data, {
                headers: { 'content-type': 'multipart/form-data' },
              }).then(response => {
                console.log(response.data)
              })
            })
        }}
      >
        <Crop fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />
      </IconButton >




      <Box sx={{ width: "100%", height: "100%", }}>
        <Cropper image={imageUrl}  //"https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000"
          aspect={6 / 1}
          crop={crop}
          rotation={rotation}
          zoom={zoom}

          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </Box>

      {imageUrl && <Slider
        size="medium"
        value={zoom}
        min={1}
        max={3}
        step={0.1}
        aria-labelledby="Zoom"
        //  classes={{ root: classes.slider }}
        onChange={(e, zoom) => setZoom(zoom)}
        sx={{
          //  padding: '22px 0px',
          //  marginLeft: "",
          marginLeft: "20px",
          marginRight: "20px",
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          my: "0",
          width: "85%",
          mx: "auto",
          color: "skyblue",
          zIndex: 600,
        }}
      />
      }

    </>
  )

}



