 
// ----------------------------------------------------------------------------------------
// Timings and classname for panic button
// ----------------------------------------------------------------------------------------
 
// Seconds, when the script should scan the search page for new images
let SECONDS_TO_FIRE = 3
 
// Time after script reparsing on click on forward and next button on related images search as well as click on related images
let SECONDS_TO_FIRE_CUT = SECONDS_TO_FIRE * 0.35
 
// Our panic class (buttons)
let GOOGLE_PANIC_CLASS = 'Google-panic-image-btn'
 
// ----------------------------------------------------------------------------------------
// Global variables
// ----------------------------------------------------------------------------------------
let fireAt = 0
let contentHeight = 0
let currentVed = 'null'
// ----------------------------------------------------------------------------------------
 
// RegExParsers
let imgRegExBase = /imgurl=(http[s]{0,1}%3A.*\?\.(jpg|jpeg|gif|png|webm|svg|tiff))/i
let imgRegExRef = /imgurlref=(http[s]{0,1}%3A.*\?\.(jpg|jpeg|gif|png|webm|svg|tiff))/i
let imgRegExBaseNoImage = /imgurl=(http[s]{0,1}%3A.[^\&\?]*)/i
 
// Gathers all images and adds a "view" link to the direct picture url
function rewampImgs () {
 
	let imgLinks = document.querySelectorAll('a.rg_l')
 
	for (let img of imgLinks) {
		if (img.childElementCount >= 2 && img.children[1].nodeName === 'SPAN') continue
	 
		let imgURL = imgRegExBase.exec(img.href)
	 
		if (imgURL === null) {
			imgURL = imgRegExRef.exec(img.href)
		 
			if (imgURL === null) {
				imgURL = imgRegExBaseNoImage.exec(img.href)
			 
				if (imgURL === null) {
					if (img.href.indexOf('imgurl=') !== -1) {
						img.style.border = '6px solid #000'
						console.log('[ERROR in "rewampImgs" of google-panic-images"] The following image link could not be extracted:')
						console.log(img)
						console.log(img.href)
					}
 
					continue
				}
			}
		}
	 
		imgURL = imgURL[1]
	 
		let hasControls = false
		for (let child of img.parentNode.childNodes) {
			if (child.className === GOOGLE_PANIC_CLASS) {
				hasControls = true
				break
			}
		}
 
		if (hasControls) continue
 
		imgURL = decodeURIComponent(imgURL)
		img.parentNode.addEventListener('mouseenter', overlayControls)
		img.parentNode.addEventListener('mouseleave', hideControls)
		img.parentNode.innerHTML += '<a target="_blank" class="' + GOOGLE_PANIC_CLASS + '" style="visibility:hidden;position:absolute;top:6%;left:0%;background:rgba(0,0,0,0.6);color:#fff;font-weight:bold;padding:7px 8% 4px 5%;border-radius:0px 12px 12px 0px;z-index:1;font-size:12px;text-decoration:none;border:1px solid #aaa;border-left: none;" href="' + imgURL + '">VIEW</a>'
	}
}
 
// ----------------------------------------------------------------------------------------
// Create / adopt the preview image link
 
function rewampPreviews () {
	let vedSrc = document.querySelector('#irc_cb')
 
	if (vedSrc === null) {
		return
	} else if (vedSrc.dataset === undefined) {
		return
	} else if (vedSrc.dataset['ved'] === undefined) {
		return
	} else if (vedSrc.dataset['ved'].startsWith(currentVed)) {
		return
	}
 
	let previewImgs = document.querySelectorAll('img.irc_mi')
		let immersiveContainers = document.querySelectorAll('div.immersive-container')  
	 
	if (previewImgs !== null && immersiveContainers !== null) {
		currentVed = document.querySelector('#irc_cb').dataset['ved'].split('_', 1)[0]
 
		// Assign control click commands
		let gControls = document.querySelectorAll('._KKw')
		for (let control of gControls) control.addEventListener('click', resetFire)
	 
		let imgControls = document.querySelectorAll('img.irc_rii')
		for (let control of imgControls) control.addEventListener('click', resetFire)
	 
		let previewImg = null
		let imgIndex = 0
	 
		for (let container of immersiveContainers) {
			if (container.dataset['ved'] !== undefined && container.dataset['ved'].startsWith(currentVed)) {
				previewImg = previewImgs[imgIndex]
				break
			}
		 
			++imgIndex;
		}
 
		if (previewImg === null) {
			imgIndex = 0
			for (let container of immersiveContainers) {
				if (container.dataset['hveid'] !== undefined) {
					previewImg = previewImgs[imgIndex]
					break
				}
 
				++imgIndex;
			}
 
			if (previewImg === null) {
				console.log('[ERROR in "rewampPreviews" of google-panic-images] Error reading out correct large preview image link with hveid, skipping view link');
				return
			}
		}
 
		let imgURLsrc = decodeURIComponent(previewImg.src)
		let imgURL = imgRegExBase.exec(imgURLsrc)
	 
		if (imgURL === null) {
						imgURL = imgRegExRef.exec(imgURLsrc)
		 
			if (imgURL === null) imgURL = imgRegExBaseNoImage.exec(imgURLsrc)
		}
	 
		if (imgURL === null) imgURL = imgURLsrc
		else imgURL = imgURL[1]
	 
		let targetContainer = document.querySelector('#irc_shc');
		let hasControls = false;
		for (let child of targetContainer.childNodes) {
			if (child.className === GOOGLE_PANIC_CLASS) {
				child.href = imgURL
				hasControls = true
				break
			}
		}
 
		if (!hasControls) targetContainer.innerHTML += '<a target="_blank" role="button" class="' + GOOGLE_PANIC_CLASS + '" style="cursor:pointer;visibility:visible;position:absolute;top:90%;left:30%;background:rgba(0,0,0,0.6);color:#fff;font-weight:bold;padding:7px 10px 4px 10px;border:1px solid #aaa;border-radius:12px;z-index:999;font-size:14px;text-decoration:none;" href="' + imgURL + '">VIEW</a>'
	}
}
 
// ----------------------------------------------------------------------------------------
// Reschedule a parsing
function resetFire () {
	fireAt = Date.now() + (SECONDS_TO_FIRE_CUT * 1000);
	contentHeight = 0;
}
 
// ----------------------------------------------------------------------------------------
// Function which does schedule the processing
function waitForLoaded () {
	if (Date.now() > fireAt) {
		let tmpHeight = document.querySelector('#cnt').clientHeight
		if (contentHeight !== tmpHeight) {
			contentHeight = tmpHeight
			try {
				rewampImgs()
			} catch (e) {
				console.log('[ERROR] in script, function rewampImgs ():')
				console.log(e);
			}
		}
	 
		try {
			rewampPreviews()
		} catch (e) {
			console.log('[ERROR] in script, function rewampPreviews ():')
			console.log(e);
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

