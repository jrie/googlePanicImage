
// ----------------------------------------------------------------------------------------
// Timings and classname for panic button
// ----------------------------------------------------------------------------------------

// Seconds, when the script should scan the search page for new images
let SECONDS_TO_FIRE = 3
let SECONDS_TO_FIRE_CUT = SECONDS_TO_FIRE * 0.35

// Our panic class (buttons)
let GOOGLE_PANIC_CLASS = 'Google-panic-image-btn-new'

// ----------------------------------------------------------------------------------------
// Global variables
// ----------------------------------------------------------------------------------------
let fireAt = 0
// ----------------------------------------------------------------------------------------

// RegExParsers
let imgRegExBase = /\[,(http[s]{0,1}(%3a|:).[^\?]*\.(jpg|jpeg|gif|png|webm|svg|tiff))/i
let imgRegExBaseImage2 = /\[,(http[s]{0,1}(%3a|:).[^\?]*\.(jpg|jpeg|gif|png|webm|svg|tiff))/i
let imgRegExBaseNoImage = /\[,(http[s]{0,1}(%3a|:).[^&\?]*)/i

let imgRegExBaseImg = /=(http[s]{0,1}(%3a|:).[^\?]*\.(jpg|jpeg|gif|png|webm|svg|tiff))/i
let imgRegExBaseImage2Img = /(http[s]{0,1}(%3a|:).[^\?]*\.(jpg|jpeg|gif|png|webm|svg|tiff))/i
let imgRegExBaseNoImageImg = /(http[s]{0,1}(%3a|:).[^\&\?]*)/i

// Gathers all images and adds a "view" link to the direct picture url
function rewampImgs () {
  let imgLinks = document.querySelectorAll('div.isv-r')

  let pageLoad = ''
  pageLoad = document.children[0].outerHTML.replace(/[\n\t\r]{1,}/g, '')

  for (let img of imgLinks) {
    let imageID = img.dataset['id']
    try {
      img.dataset['irul'] = pageLoad.match(new RegExp('[0-9]?,"' + imageID + '",.*\],'))[0].split('"', 6)
    } catch (e) {
      continue
    }

    let imgURL = imgRegExBase.exec(img.dataset['irul'])

    if (imgURL !== null && imgURL[1].startsWith('=')) imgURL = imgRegExBaseImage2.exec(img.dataset['irul'])

    if (imgURL === null) {
      imgURL = imgRegExBaseNoImage.exec(img.dataset['irul'])

      if (imgURL === null) {
        if (img.dataset['irul'] === '') {
          img.style.border = '6px solid #000'
          console.log('[ERROR in "rewampImgs" of google-panic-images"] The following image link could not be extracted:')
          console.log(img)
        }

        continue
      }
    }

    imgURL = imgURL[1]

    if (imgURL.indexOf(')') !== -1) {
      let imgData = img.dataset['irul'].split('/')
      imgURL = decodeURIComponent('https://' + imgData[imgData.length - 1])
    }

    let hasControls = false
    for (let child of img.childNodes) {
      if (child.className === GOOGLE_PANIC_CLASS) {
        hasControls = true
        break
      }
    }

    if (hasControls) continue

    imgURL = decodeURIComponent(imgURL)
    img.addEventListener('mouseenter', overlayControls)
    img.addEventListener('mouseleave', hideControls)
    img.innerHTML += '<a target="_blank" class="' + GOOGLE_PANIC_CLASS + '" style="visibility:hidden;position:absolute;top:6%;left:0%;background:rgba(0,0,0,0.6);color:#fff;font-weight:bold;padding:7px 8% 4px 5%;border-radius:0px 12px 12px 0px;z-index:1;font-size:12px;text-decoration:none;border:1px solid #aaa;border-left: none;" href="' + imgURL + '">VIEW</a>'
  }

  for (let btn of document.querySelectorAll('a.' + GOOGLE_PANIC_CLASS)) {
    btn.removeEventListener('click', openImgLink)
    btn.addEventListener('click', openImgLink)
  }
}

function openImgLink (evt) {
  evt.preventDefault()
  window.open(evt.target.href, '_blank')
}

function readURLforImg (imgLink) {
  if (imgLink.href === '') return

  imgLink.dataset['irul'] = imgLink.href

  let imgURL = imgRegExBaseImg.exec(imgLink.dataset['irul'])

  if (imgURL !== null && imgURL[1].startsWith('=')) imgURL = imgRegExBaseImage2Img.exec(imgLink.dataset['irul'])

  if (imgURL === null) {
    imgURL = imgRegExBaseNoImageImg.exec(imgLink.dataset['irul'])

    if (imgURL === null) {
      if (imgLink.dataset['irul'] === '') {
        imgLink.parentNode.style.border = '6px solid #000'
        console.log('[ERROR in "readURLforImg" of google-panic-images"] The following image link could not be extracted:')
        console.log(imgLink)
      }
    }
  }

  imgURL = imgURL[1]

  if (imgURL.indexOf(')') !== -1) {
    let imgData = img.dataset['irul'].split('/')
    imgURL = decodeURIComponent('https://' + imgData[imgData.length - 1])
  }

  let hasControls = false

  for (let child of imgLink.parentNode.childNodes) {
    if (child.className === GOOGLE_PANIC_CLASS) {
      hasControls = true
      break
    }
  }

  if (hasControls) return

  imgURL = decodeURIComponent(imgURL)
  imgLink.parentNode.addEventListener('mouseenter', overlayControls)
  imgLink.parentNode.addEventListener('mouseleave', hideControls)
  imgLink.parentNode.innerHTML += '<a target="_blank" class="' + GOOGLE_PANIC_CLASS + '" style="visibility:hidden;position:absolute;top:6%;left:0%;background:rgba(0,0,0,0.6);color:#fff;font-weight:bold;padding:7px 8% 4px 5%;border-radius:0px 12px 12px 0px;z-index:1;font-size:12px;text-decoration:none;border:1px solid #aaa;border-left: none;" href="' + imgURL + '">VIEW</a>'

  for (let btn of document.querySelectorAll('a.' + GOOGLE_PANIC_CLASS)) {
    btn.removeEventListener('click', openImgLink)
    btn.addEventListener('click', openImgLink)
  }
}

function rewampImgs2 () {
  let imgLinks = document.querySelectorAll('div#islsp div.isv-r a:nth-of-type(1)')

  for (let imgLink of imgLinks) {
    if (imgLink.dataset['navigation'] !== undefined) continue
    imgLink.parentNode.parentNode.addEventListener('mouseenter', function (evt) {
      readURLforImg(evt.target.parentNode.parentNode)
    })

    imgLink.parentNode.parentNode.addEventListener('click', function (evt) {
      readURLforImg(evt.target.parentNode.parentNode)
    })
  }
}

// ----------------------------------------------------------------------------------------
// Reschedule a parsing
function resetFire () {
  fireAt = Date.now() + (SECONDS_TO_FIRE_CUT * 1000)
}

// ----------------------------------------------------------------------------------------
// Function which does schedule the processing
function waitForLoaded () {
  if (Date.now() > fireAt) {
    try {
      rewampImgs()
    } catch (e) {
      console.log('[ERROR] in script, function rewampImgs():')
      console.log(e)
    }

    try {
      rewampImgs2()
    } catch (e) {
      console.log('[ERROR] in script, function rewampImgs2():')
      console.log(e)
    }

    try {
      let imgs = document.querySelectorAll('div#islsp div.isv-r')
      for (let img of imgs) {
        img.addEventListener('click', resetFire)
      }
    } catch (e) {
    }

    fireAt = Date.now() + (SECONDS_TO_FIRE * 1000)
  }

  window.requestAnimationFrame(waitForLoaded)
}

// ----------------------------------------------------------------------------------------
// Display the controls, when the mouse is hovered over the image
function overlayControls (event) {
  let img = event.target
  for (let child of img.childNodes) {
    if (child.className === GOOGLE_PANIC_CLASS) {
      child.style.visibility = 'visible'
      break
    }
  }
}

// Hide the controls, if the mouse is moved out of the image
function hideControls (event) {
  let img = event.target
  for (let child of img.childNodes) {
    if (child.className === GOOGLE_PANIC_CLASS) {
      child.style.visibility = 'hidden'
      break
    }
  }
}

// ----------------------------------------------------------------------------------------
window.requestAnimationFrame(waitForLoaded)
