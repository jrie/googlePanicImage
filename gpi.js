
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
let imgRegExBase = /\[,(http[s]{0,1}(%3a|:).[^\&]*\.(jpg|jpeg|gif|png|webm|svg|tiff|webp|avif))/i
let imgRegExBase1 = /imgurl=(http[s]{0,1}(%3a|:).*\.(jpg|jpeg|gif|png|webm|svg|tiff|webp|avif))/i
let imgRegExBase2 = /=(http[s]{0,1}(%3a|:).[^\&]*\.(jpg|jpeg|gif|png|webm|svg|tiff|webp|avif))/i
let imgRegExBaseNoImage = /imgurl=(http[s]{0,1}(%3a|:).[^\&\?]*)/i
let imgRegExBaseNoImage1 = /imgurl=\[,(http[s]{0,1}(%3a|:).[^"\&\?"]*)/i
let imgRegExBaseNoImage2 = /\[,(http[s]{0,1}(%3a|:).[^\&\?]*)/i
let imgRegExBaseNoImage3 = /=(http[s]{0,1}(%3a|:).[^\&\?]*)/i

let imgRegExBaseImg = /=(http[s]{0,1}(%3a|:).[^\&]*\.(jpg|jpeg|gif|png|webm|svg|tiff|webp|avif))/i
let imgRegExBaseImage2Img = /(http[s]{0,1}(%3a|:).[^\&]*\.(jpg|jpeg|gif|png|webm|svg|tiff|webp|avif))/i
let imgRegExBaseNoImageImg = /(http[s]{0,1}(%3a|:).[^\&\?]*)/i

let imgFacebook = /(http[s]{0,1}(%3a|:)\/\/lookaside\.fbsbx\.com\/lookaside\/crawler\/media\/.*)/i

// Gathers all images and adds a "VIEW" link to the direct picture url
function rewampImgs () {
  try {
    let imgLinks = document.querySelectorAll('div.isv-r')
    let isFacebook = false

    let pageLoad = ''
    pageLoad = document.children[0].outerHTML.replace(/[\n\t\r]{1,}/g, '')

    for (let img of imgLinks) {

      if (hasControls(img)) continue

      isFacebook = false
      let imageID = img.dataset['id']
      try {
        let imgData = pageLoad.match(new RegExp('[0-9]?,"' + imageID + '",.*\],'))[0].split('"', 6)
        imgData.splice(0, imgData.length - 3)
        img.dataset['irul'] = imgData
      } catch (err) {
        continue
      }

      let imgURL = imgRegExBase1.exec(img.children[0].href)
      if (imgURL === null) {
        imgURL = imgFacebook.exec(img.dataset['irul']);
        if (imgURL !== null) isFacebook = true;
      }

      if (!isFacebook) {
        if (imgURL === '' || imgURL === null) imgURL = imgRegExBase1.exec(img.dataset['irul'])
        if (imgURL === '' || imgURL === null) imgURL = imgRegExBase2.exec(img.children[0].href)

        if (imgURL === null) imgURL = imgRegExBase2.exec(img.dataset['irul'])
        if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

        if (imgURL === null) imgURL = imgRegExBaseNoImage3.exec(img.dataset['irul'])
        if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

        if (imgURL === null) imgURL = imgRegExBaseNoImage2.exec(img.dataset['irul'])
        if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

        if (imgURL === null) {
          if (imgURL === null) imgURL = imgRegExBaseNoImage1.exec(img.dataset['irul'])
          if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

          if (imgURL === null) imgURL = imgRegExBase.exec(img.dataset['irul'])
          if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

          if (imgURL === null) {
            imgURL = imgRegExBaseNoImage.exec(img.dataset['irul'])
            if (imgURL === null) {
              img.style.border = '6px solid #000'
              continue
            }
          }
        }
      }

      imgURL = imgURL[1]
      try {
        for (let entry of imgURL.match(/[\\]{1,}u[a-fA-F0-9]{0,4}/gi)) imgURL = imgURL.replace(entry, String.fromCharCode(parseInt(entry.replace(/\\u/gi, ''), 16)))
      } catch (err) {
        if (imgURL.indexOf(')') !== -1) {
          let imgData = img.dataset['irul'].split('/')
          imgURL = 'https://' + decodeURIComponent(imgData[imgData.length - 1])
        } else {
          imgURL = decodeURIComponent(imgURL)
        }
      }

      let domButton = document.createElement('a')
      domButton.target = '_blank'
      domButton.href = imgURL
      domButton.role = 'button'
      domButton.className = GOOGLE_PANIC_CLASS
      domButton.appendChild(document.createTextNode('VIEW'))
      domButton.style['visibility'] = 'hidden'
      domButton.style['position'] = 'absolute'
      domButton.style['top'] = '10%'
      domButton.style['left'] = '0px'
      domButton.style['background'] = 'rgba(0,0,0,0.6)'
      domButton.style['color'] = '#fff'
      domButton.style['font-weight'] = 'bold'
      domButton.style['padding'] = '0.5em 1.5em'
      domButton.style['border-radius'] = '0px 12px 12px 0px'
      domButton.style['z-index'] = '1'
      domButton.style['font-size'] = '12px'
      domButton.style['text-decoration'] = 'none'
      domButton.style['border'] = '1px solid #aaa'
      domButton.style['border-left'] = 'none'
      img.appendChild(domButton)

      img.removeEventListener('mouseenter', overlayControls)
      img.removeEventListener('mousemove', overlayControls)
      img.removeEventListener('mouseleave', hideControls)

      img.addEventListener('mouseenter', overlayControls)
      img.addEventListener('mousemove', overlayControls)
      img.addEventListener('mouseleave', hideControls)
    }

    for (let btn of document.querySelectorAll('a.' + GOOGLE_PANIC_CLASS)) {
      btn.removeEventListener('click', openImgLink)
      btn.addEventListener('click', openImgLink)
    }

  } catch (err) {
    console.log(err)
  }
}

function openImgLink (evt) {
  evt.preventDefault()
  window.open(evt.target.href, '_blank')
}

function readURLforImg (imgLink) {

  try {
    let imgSrc = null

    imgLink.dataset['irul'] = imgLink.href
    for (let child of imgLink.childNodes) {
      if (child.getAttribute('src') !== null) {
        imgSrc = child.getAttribute('src')
        break
      }
    }

    let isFacebook = false
    let imgURL = null
    if (imgSrc !== null) {
      imgURL = imgSrc
    } else {
      imgURL = imgRegExBase1.exec(imgLink.href)
      if (imgURL === null) {
        imgURL = imgFacebook.exec(imgLink.dataset['irul']);
        if (imgURL !== null) isFacebook = true;
      }

      if (!isFacebook) {
        if (imgURL === '' || imgURL === null) imgURL = imgRegExBase1.exec(imgLink.dataset['irul'])
        if (imgURL === '' || imgURL === null) imgURL = imgRegExBase2.exec(imgLink.parentNode.children[0].href)

        if (imgURL === null) imgURL = imgRegExBase2.exec(imgLink.dataset['irul'])
        if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

        if (imgURL === null) imgURL = imgRegExBaseNoImage3.exec(imgLink.dataset['irul'])
        if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

        if (imgURL === null) imgURL = imgRegExBaseNoImage2.exec(imgLink.dataset['irul'])
        if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

        if (imgURL === null) {
          if (imgURL === null) imgURL = imgRegExBaseNoImage1.exec(imgLink.dataset['irul'])
          if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null

          if (imgURL === null) imgURL = imgRegExBase.exec(imgLink.dataset['irul'])
          if (imgURL !== null && imgURL[1].startsWith('https://encrypted-tbn0.gstatic.com/images')) imgURL = null
        }
      }
      if (imgURL === null) return

      imgURL = imgURL[1]
    }

    if (imgURL.indexOf(')') !== -1) {
      let imgData = imgLink.dataset['irul'].split('/')
      imgURL = 'https://' + decodeURIComponent(imgData[imgData.length - 1])
    } else imgURL = decodeURIComponent(imgURL)

    let domButton = document.createElement('a')
    domButton.target = '_blank'
    domButton.href = imgURL
    domButton.role = 'button'
    domButton.className = GOOGLE_PANIC_CLASS
    domButton.appendChild(document.createTextNode('VIEW'))
    domButton.style['visibility'] = 'hidden'
    domButton.style['position'] = 'absolute'
    domButton.style['top'] = '10%'
    domButton.style['left'] = '0px'
    domButton.style['background'] = 'rgba(0,0,0,0.6)'
    domButton.style['color'] = '#fff'
    domButton.style['font-weight'] = 'bold'
    if (imgSrc === null) domButton.style['padding'] = '0.65em 2em'
    else domButton.style['padding'] = '1.25em 2em'
    domButton.style['border-radius'] = '0px 12px 12px 0px'
    domButton.style['z-index'] = '1'
    domButton.style['font-size'] = '12px'
    domButton.style['text-decoration'] = 'none'
    domButton.style['border'] = '1px solid #aaa'
    domButton.style['border-left'] = 'none'
    imgLink.parentNode.appendChild(domButton)

    for (let btn of document.querySelectorAll('a.' + GOOGLE_PANIC_CLASS)) {
      btn.removeEventListener('click', openImgLink)
      btn.addEventListener('click', openImgLink)
    }

    imgLink.parentNode.removeEventListener('mouseenter', overlayControls)
    imgLink.parentNode.removeEventListener('mousemove', overlayControls)
    imgLink.parentNode.removeEventListener('mouseleave', hideControls)

    imgLink.parentNode.addEventListener('mouseenter', overlayControls)
    imgLink.parentNode.addEventListener('mousemove', overlayControls)
    imgLink.parentNode.addEventListener('mouseleave', hideControls)

    imgLink.parentNode.dispatchEvent(new MouseEvent('mouseenter', { 'target': imgLink.parentNode }))
  } catch (err) {
    console.log(err)
  }
}

function hasControls(parentNode) {
  try {
    let childNodeCount = parentNode.childNodes.length
    let nodes = parentNode.childNodes;
    for (let x = childNodeCount - 1; x >= 0; --x) {
      if (nodes[x].className === GOOGLE_PANIC_CLASS) {
        return true
      }
    }
    return false
  } catch (err) {
    console.log(err)
    return false
  }
}

function rewampImgs2 () {
  let imgLinks = document.querySelectorAll('div#islsp div.isv-r > a')

  for (let imgLink of imgLinks) {
    if (imgLink.dataset['navigation'] !== undefined) continue
    if (hasControls(imgLink.parentNode)) continue

    imgLink.addEventListener('click', function (evt) {
      console.log('in2')
      if (!hasControls(evt.target.parentNode.parentNode.parentNode)) {
        evt.stopPropagation()
        evt.preventDefault()
        readURLforImg(evt.target.parentNode.parentNode)
      }
    })
  }
}

function rewampImgs3 () {
  let imgLinks = document.querySelectorAll('div#islrg div.isv-r > a')

  for (let imgLink of imgLinks) {
    if (imgLink.dataset['navigation'] !== undefined) continue
    else {
      if (hasControls(imgLink.parentNode)) continue
      imgLink.addEventListener('mouseenter', function (evt) { readURLforImg(evt.target.parentNode.parentNode) })
      imgLink.addEventListener('click', function (evt) {
        console.log('in3')
        if (!hasControls(evt.target.parentNode.parentNode.parentNode)) {
          evt.stopPropagation()
          evt.preventDefault()
          readURLforImg(evt.target.parentNode.parentNode)
        }
      })
    }
  }
}

function rewampImgs4 () {
  let imgLinks = document.querySelectorAll('div#islsp  a[role="link"]')

  for (let imgLink of imgLinks) {
    if (imgLink.dataset['navigation'] !== undefined) continue
    if (hasControls(imgLink.parentNode)) continue
    else {
      imgLink.addEventListener('mouseenter', function (evt) { readURLforImg(evt.target.parentNode.parentNode) })
      imgLink.addEventListener('click', function (evt) {
        console.log('in4')
        if (!hasControls(evt.target.parentNode.parentNode)) {
          evt.stopPropagation()
          evt.preventDefault()
          readURLforImg(evt.target.parentNode)
        }
      })
    }
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
    } catch (err) {
      console.log('[ERROR] in script, function rewampImgs():')
      console.log(err)
    }

    try {
      rewampImgs2()
    } catch (err) {
      console.log('[ERROR] in script, function rewampImgs2():')
      console.log(err)
    }

    try {
      rewampImgs3()
    } catch (err) {
      console.log('[ERROR] in script, function rewampImgs3():')
      console.log(err)
    }

    try {
      rewampImgs4()
    } catch (err) {
      console.log('[ERROR] in script, function rewampImgs3():')
      console.log(err)
    }

    try {
      let imgs = document.querySelectorAll('div#islsp div.isv-r')
      for (let img of imgs) img.addEventListener('click', resetFire)
    } catch (err) {
      console.log(err)
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
