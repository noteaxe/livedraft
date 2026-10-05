const version = "0.1.0"

const UndoRedojs = window.UndoRedojs
const myHistory = new UndoRedojs(5)
const savebackups = new Object()

var showsavewarning = true

const inline_elements = [
    'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'cite', 'code',
    'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object',
    'output', 'q', 's', 'samp', 'select', 'small', 'span', 'strong',
    'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var', 'dd', 'dl', 
    'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p',
]

document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
});

window.onload = function(){
	richController = document.getElementById("richcontrolpanel")
	htmlPopUpTemp = document.getElementById("htmlpoptemplate")
	preview = document.getElementById("preview")
	createHTMLframe()
	
	cssCode = document.getElementById("cssCode")
	htmlCode = document.getElementById("htmlCode")
	
	richText = document.getElementById("richeditor")
	
	htmlFrame = document.getElementById("htmlframe")
	if (htmlFrame){
		htmlDoc = htmlFrame.contentWindow.document
		workskin = htmlDoc.getElementById("workskin")
		userstuff = htmlFrame.contentWindow.document.getElementsByClassName("userstuff")[0]
	};
	sessionStorage.removeItem("backspace")
	sessionStorage.removeItem("enter")

	//Check for saved files
	fileTemp = document.getElementById("fileinfotemplate")
	filewindow = document.getElementById('filelist')

	let savedFiles = { ...localStorage };

	delete savedFiles.openCSS
	delete savedFiles.openText
	delete savedFiles.saveArray
	delete savedFiles.ldVersion


	let objArray = []
	let nameArray = []

	for (const [key, value] of Object.entries(savedFiles)) {
		if (isValidJSON(value) && JSON.parse(value)[2] == 'LiveDraftWork'){
			nameArray.push(key)
		}
	}
	
	nameArray.sort()

	objArray.sort((a, b) => String(a.name).localeCompare(String(b.name)));

	for (let name of nameArray){
		let filetemplate = fileTemp.content.cloneNode(true).firstElementChild;
		filetemplate.getElementsByClassName('webFileName')[0].innerHTML = name;
		filewindow.appendChild(filetemplate);
	}

	//Check/Get Version
	const storedVersion = localStorage.getItem("ldVersion")
	if (storedVersion == null){
		localStorage.setItem("ldVersion", version)
	} else {
		if (storedVersion != version){
			
		}
	}

	//Check for backups
	let backups = JSON.parse(sessionStorage.getItem("backup"))
	if (backups != null || undefined){
		for (const [key, value] of Object.entries(backups)) {
		savebackups[key] = value
		}
	}

	setResetInterval(true)
}

var timer = 0;

function setResetInterval(bool){
	if (showsavewarning){
		if(bool){
		timer = setInterval(function(){
		document.getElementById("saveSuggestPopUp").classList.add("suggestOpen")
		},60000 * 30);
		}else{
			clearInterval(timer); 
		}
	}
  }

function stopinterval(){
	setResetInterval(false)
	document.getElementById("saveSuggestPopUp").classList.remove("suggestOpen")
	showsavewarning = false
}

function closesavepopup(){
	setResetInterval(false)
	document.getElementById("saveSuggestPopUp").classList.remove("suggestOpen")
	setResetInterval(true)
}


// Mutation Observer

// Options for the observer (which mutations to observe)
const config = {attributes: true, childList: true, subtree: true, characterData: true, characterDataOldValue: true};

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
	let types = []
	var target = null
	var sibling = null
	for (const mutation of mutationList) {
		if (mutation.type != "attributes") {
			if (myHistory.current() != userstuff.innerHTML){
				myHistory.record(userstuff.innerHTML, true)
			}
		  }
		   types.push(mutation.type)
		   target = mutation.target
	}
	if (types.includes("attributes")){
		sibling = target.previousSibling
		cleanFormatting(userstuff)
		observer.disconnect();

		let temp = document.createElement('div')
		temp.innerHTML = myHistory.current()

		if (myHistory.current() != userstuff.innerHTML){
			myHistory.record(userstuff.innerHTML, true)
		}
		observer.observe(userstuff, config);
	}
	
	if (sessionStorage.getItem("backspace") == 'down' && target.tagName == 'SPAN'){
		let parent = target.parentNode;
		parent.innerHTML = parent.textContent;
		let selection = htmlDoc.getSelection();
		selection.extend(selection.anchorNode, sibling.textContent.length)
		htmlDoc.getSelection().collapseToEnd()
	}

	if (sessionStorage.getItem("enter") == 'down'){
		if (target.previousElementSibling != null){
			if (target.previousElementSibling.tagName == "UL" || target.previousElementSibling.tagName == "OL" ){
				let newNode = htmlDoc.getSelection().focusNode
				let copy = newNode
				let p = document.createElement("p");
				p.innerHTML = '+'
				newNode.parentNode.after(p)
				copy.remove()

				let range = htmlDoc.createRange()
				range.selectNode(p);
				let selection =  htmlDoc.getSelection()
				selection.removeAllRanges()
				selection.addRange(range)
				htmlDoc.execCommand('delete')
		} 
	}}
	localStorage.setItem("openText", myHistory.current());
	localStorage.setItem("openCSS", htmlDoc.getElementById("userstyle").innerHTML)
	calcWordCount(userstuff, htmlDoc.getElementById("wordcount"))
};

const observer = new MutationObserver(callback);

window.addEventListener("keydown", keydown)
window.addEventListener("keyup", keyup)

//Key handler
function keydown(evt){
	evt.stopImmediatePropagation();

	if (evt.key.toLowerCase() == 'z' && (evt.ctrlKey || evt.metaKey) && evt.shiftKey) {
		evt.preventDefault()
	  	redoFunc()
	} else if (evt.key.toLowerCase() == 'z' && (evt.ctrlKey || evt.metaKey)) {
		evt.preventDefault()
	  	undoFunc()
	}
	
	if (evt.key == 'Backspace'){
		sessionStorage.setItem("backspace", "down")
	}

	if (evt.key == 'Enter'){
		sessionStorage.setItem("enter", "down")
	}
}

function keyup(evt){
	sessionStorage.removeItem("backspace")
	sessionStorage.removeItem("enter")
}

function undoFunc(){
	let history = document.myHistory
	if (history.undo(true) !== undefined) {
        document.body.getElementsByClassName('userstuff')[0].innerHTML = history.undo()
    }
}

function redoFunc(){
	let history = document.myHistory
	if (history.redo(true) !== undefined) {
        document.body.getElementsByClassName('userstuff')[0].innerHTML = history.redo()
    }
}

function calcWordCount(userstuff, countervalue){
	let children = userstuff.childNodes
	let wordcount = 0
	for (let child of children){
		let count = child.textContent.trim().split(' ').length
		if (child.textContent.trim().split(' ')[0].length != 0){
			wordcount = wordcount + count
		} else {
			wordcount = wordcount + 0
		}
	}
	countervalue.innerHTML = wordcount
}

function formatForAo3(html){
	const container = document.createElement("div");
	container.innerHTML = html.outerHTML;
	const allElms = container.querySelectorAll("*")
	let allTextElements = [];
	let justTextElements = [];

	allElms.forEach((ele) => (ele.innerText != undefined && ele.innerText.length > 0) && allTextElements.push(ele) );
	for (let elm of allTextElements){
		if (elm.children.length == 0){
			justTextElements.push(elm)
		}
	}
	for (let e of justTextElements){
		if (inline_elements.includes(e.tagName.toLowerCase()) == false){
			const newp = document.createElement("p")
			newp.innerHTML = e.innerHTML
			e.innerHTML = newp.outerHTML
		}
		
	}
	
	let spanelements = container.querySelectorAll("span")
	for (span of spanelements){
		const newp = document.createElement("p")
		let newHTML = span.outerHTML

		if (span.previousElementSibling == null){
			let siblings = []

			for (const [key, value] of Object.entries(span.parentNode.children)) {
					siblings.push(value)
			}
			siblings.shift()
			for (let s of siblings){
				newHTML = newHTML + s.outerHTML
			}
		} else {
			//
		}
		newp.innerHTML = newHTML
		span.replaceWith(newp)
	}

	let imgElements = container.querySelectorAll("img")
	for (img of imgElements){
		if (img.parentNode.tagName != 'P'){
			const newimg = document.createElement("p")
			newimg.innerHTML = img.outerHTML

			img.replaceWith(newimg)
		}
	}

	const sanitized = container.firstChild;
	return sanitized
}


function toggleStyle(){
	let header = document.getElementById("mainheader")
	let mainbody = document.body
	let textBoxes = document.getElementsByClassName('code')
	let editorButton = document.getElementsByClassName('editorbuttons')

	let fileform = document.getElementById("fileform")
	let fileinput = document.getElementById("file-input")

	let toggled = document.getElementById("styleToggle").checked
	if (toggled == true){
		mainbody.classList.add("darkModeBody")
		htmlDoc.body.style = "background: #141415 !important; color: white"
		htmlDoc.getElementById("editTools").classList.add("darkModeEditTools")
		for (let elm of textBoxes){
			elm.classList.add("darkModeBody")
		}

		fileform.classList.add("formdark")
		fileinput.classList.add("inputdark")

	}
	
	if (toggled == false){
		mainbody.classList.remove("darkModeBody")
		htmlDoc.body.removeAttribute("style")
		htmlDoc.getElementById("editTools").classList.remove("darkModeEditTools")
		for (let elm of textBoxes){
			elm.classList.remove("darkModeBody")
		}
		for (let elm of editorButton){
			elm.classList.remove("darkModeButtons")
		}

		fileform.classList.remove("formdark")
		fileinput.classList.remove("inputdark")
	}
	
}


//CREATE MAIN IFRAME
function createHTMLframe(){
	if (preview){
		const el = document.createElement("iframe");
		el.width = "100%";
		el.height = "100%";
		el.id = "htmlframe"
		el.style = "resize: horizontal; overflow: scroll; max-width: 100%;"
		preview.appendChild(el)
		let iframeDoc = el.contentWindow.document
		let iframeBody = iframeDoc.getElementsByTagName("body")[0]
		let iframeHead = iframeDoc.getElementsByTagName("head")[0]
		
		let script = iframeDoc.createElement("script")
		let purify = iframeDoc.createElement("script")
		let rs = iframeDoc.createElement("script")
		let highlighter = iframeDoc.createElement("script")
		let loadHighlighter = iframeDoc.createElement("script")
		
		rs.src = "UndoRedo.js"
		script.src="main.js"
		highlighter.src = './highlight/highlight.js'
		loadHighlighter.innerHTML = 'hljs.initHighlightingOnLoad();'
		
		//let style = iframeDoc.createElement("style")
		let syntaxstyle = iframeDoc.createElement("link")
		let ao3style = iframeDoc.createElement("link")
		let userstyle = iframeDoc.createElement("style")
		
		syntaxstyle.setAttribute('rel', 'stylesheet')
		syntaxstyle.setAttribute('href', './highlight/styles/xcode.css')
	
		ao3style.setAttribute('rel', 'stylesheet')
		ao3style.setAttribute('href', 'ao3.css')
	
		let head = iframeDoc.getElementsByTagName("head")[0]
		
		head.innerHTML = '<meta charset="utf-8">'
		userstyle.id = 'userstyle'
		
		let controltemplate = richController.content.cloneNode(true).firstElementChild;
		let htmltemp = htmlPopUpTemp.content.cloneNode(true).firstElementChild;
		
		let workskin = iframeDoc.createElement("div")
		workskin.id = "workskin"
		
		let container = iframeDoc.createElement("div")
		container.id="editorcontainer"
		
		let userstuff = iframeDoc.createElement("div")
		userstuff.classList.add("userstuff")
		
		
		workskin.appendChild(userstuff)
		container.appendChild(controltemplate)
		container.appendChild(htmltemp)
		container.append(workskin)
		
		iframeBody.appendChild(container)
	
		head.appendChild(syntaxstyle)
		head.appendChild(ao3style)
		head.appendChild(userstyle)
		head.appendChild(rs)
		head.appendChild(highlighter)
		head.appendChild(script)
		
		observer.observe(userstuff, config);
		
		if (myHistory.current().innerHTML != userstuff.innerHTML){
	  		myHistory.record(userstuff.innerHTML, true)
	  	}
		iframeConfig()
		
		if (localStorage.getItem("openText") != null){
			userstuff.innerHTML = localStorage.getItem("openText")
		}
		
		if (localStorage.getItem("openCSS") != null){
			userstyle.innerHTML = localStorage.getItem("openCSS")
			cssCode.value = localStorage.getItem("openCSS")
		};
	}
	
}

function addListener(){
	window.addEventListener('keydown', function(evt) {
		evt.stopImmediatePropagation();
		if (evt.key === 'Z' && (evt.ctrlKey || evt.metaKey) && evt.shiftKey) {
		  redoFunc()
		} else if (evt.key === 'Z' && (evt.ctrlKey || evt.metaKey)) {
		  undoFunc()
		}
	});
}

function iframeConfig(){
	let iframe = document.querySelector('iframe');
	let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	iframeDocument.myHistory = myHistory;
}

var selectOffset = []

async function doubleclickBox(element, e){
	let prev = element.parentNode.getElementsByClassName("highlighter")[0]
	if (prev == undefined){
		let s = document.getSelection()
		element.classList.add("highlighter")
	} else {
		if (prev != undefined){
			prev.classList.remove("highlighter")
		}
	}
}

document.addEventListener('mousedown', function(event) {
  if (event.detail > 1) {
    event.preventDefault();
  }
}, false);

function clickBox(element, e){
	let prev = element.parentNode.getElementsByClassName("highlighter")[0]
	if (prev != undefined){
		prev.classList.remove("highlighter")
	}
}

function deleteNode(){
	let selected = userstuff.getElementsByClassName("highlighter")[0]
	if(selected != undefined){
		selected.remove()
	}
}

function moveDown(){
	let parent = window.getSelection().anchorNode.parentNode;
	var els = [];
	while (parent) {
    	els.unshift(parent);
    	parent = parent.parentNode;
	};
	let userstuff = els[0].getElementsByClassName("userstuff")[0]
	let selected = userstuff.getElementsByClassName("highlighter")[0]
	let allElms = userstuff.getElementsByClassName("elmContainer")
	
	if(selected != undefined && allElms.length > 1){
		if (selected.nextElementSibling != null){
			let sibling = selected.nextElementSibling
			let nextSibling = sibling.nextElementSibling
			let clone = selected.cloneNode(true)
			selected.remove()
			userstuff.insertBefore(clone, nextSibling)
		}
	}
}
function moveUp(){
	let parent = window.getSelection().anchorNode.parentNode;
	var els = [];
	while (parent) {
    	els.unshift(parent);
    	parent = parent.parentNode;
	};
	let userstuff = els[0].getElementsByClassName("userstuff")[0]
	let selected = userstuff.getElementsByClassName("highlighter")[0]
	let allElms = userstuff.getElementsByClassName("elmContainer")
	if(selected != undefined && allElms.length > 1){
		if (selected.previousElementSibling != null){
			let sibling = selected.previousElementSibling 
			let clone = selected.cloneNode(true)
			selected.remove()
			userstuff.insertBefore(clone, sibling)
		}
	}
}


async function createCopy(node){
	let checked = formatForAo3(node)
	await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': node.outerHTML,
        }),
      ]);
}

//ADDS STYLED HTML ELEMENT
function addCodeBlock(){
	let xmlString = htmlCode.value;
	let doc = new DOMParser().parseFromString(xmlString, "text/html");
	let children = doc.body.children
	let elmContainer = document.createElement("div")
	elmContainer.classList.add("elmContainer")
	elmContainer.setAttribute('onclick', 'clickBox(this, event)')
	elmContainer.setAttribute('ondblclick', 'doubleclickBox(this, event)')
	let kids = []
	Array.prototype.forEach.call(doc.body.children, element => {
		let child = element
		kids.push(child)
	});
	
	Array.prototype.forEach.call(kids, element => {
		elmContainer.appendChild(element)
	});
	
	clean = formatForAo3(elmContainer)
	clean.setAttribute('contenteditable', 'true')
	userstuff.appendChild(clean)
	
}

function updateCSS(){
	css = cssCode.value
	if (htmlDoc.getElementById("userstyle") == null){
		let style = htmlDoc.createElement("style")
		
		style.id = "userstyle"
		style.innerHTML = css
		
		let head = htmlDoc.getElementsByTagName("head")[0]
		htmlDoc.getElementsByTagName("html")[0].insertBefore(style, head)
	} else {
		let stylesheet = htmlDoc.getElementById("userstyle")
		stylesheet.innerHTML = css
	}
	localStorage.setItem("openCSS", css);
}

function addRichText(){
	let template = richText.content.cloneNode(true).firstElementChild;
	userstuff.append(template)
}

function removeAttributes(child){
	let alignment = child.style.textAlign
	while(child.attributes.length > 0){
		child.removeAttribute(child.attributes[0].name)
	}
	if (alignment == 'center'){
		child.setAttribute("style", "text-align: center")
	}
	if (alignment == 'right'){
		child.setAttribute("style", "text-align: right")
	}
}

function cleanFormatting(u){
	let nodes = null
	if (u == null){
		nodes = document.getElementsByClassName("elmContainer")
	} else {
		nodes = u.getElementsByClassName("elmContainer")
	}
	for (let n of nodes){
		let children = n.querySelectorAll("*")
		for (let child of children){
			let alignment = child.style.textAlign
			let alignAttribute = child.getAttribute('align')
			let fontWeight = child.style.fontWeight
			let textDecoration = child.style.textDecoration
			let className = ''
			let srcName = ''
			while(child.attributes.length > 0){
			if (child.attributes[0].name == "class"){
				className = child.attributes[0]
			}
			if (child.attributes[0].name == "src"){
				srcName = child.attributes[0]
			}
			child.removeAttribute(child.attributes[0].name)
			}
			if (className != ''){
				child.setAttribute(className.name, className.value)
			}
			
			if (srcName != ''){
				child.setAttribute(srcName.name, srcName.value)
			}
			
			if (alignment == 'center' || alignAttribute == 'center'){
				child.setAttribute("style", "text-align: center")
			}
	
			if (alignment == 'right' || alignAttribute == 'right'){
				child.setAttribute("style", "text-align: right")
			}
			
			if (fontWeight == '700'){
				let content = child.innerHTML
				let bold = document.createElement("b");
				bold.innerHTML = content
				child.replaceWith(bold)
			}
			
			if (textDecoration == 'underline'){
				let content = child.innerHTML
				let underline = document.createElement("u");
				underline.innerHTML = content
				child.replaceWith(underline)
			}
			
			if (child.textContent.length == 0 && child.tagName == 'P'){
				if (child.children.length != 0){
					if (child.firstElementChild.tagName != "IMG"){
					child.remove() 
				}
				}
			}
			
	}
	}
	}

function justifyright(){
	document.execCommand("justifyRight");
}

function justifyleft(){
	document.execCommand("justifyLeft");
}

function justifycenter(){
	document.execCommand("justifyCenter");
}


function getHighlightedElm(){
	let selected = window.getSelection().anchorNode.parentNode;
	let result = null
	var els = [];
	while (selected) {
		els.unshift(selected);
		selected = selected.parentNode;
	}
	Array.prototype.forEach.call(els, e => {
		let child = e
		if (e.className != undefined){
			let classes = e.className.split(' ').filter(item => item !== '' && item !== null && item !== undefined);
			let firstClass = classes[0]
			if (classes.includes('elmContainer')){
				indx = els.indexOf(e)
				result = els[indx+1]
				}
			}
	})
	return result
}


function delHighlighted(){
	let range = document.createRange();
	let sel = window.getSelection()
	let result = getHighlightedElm();
	range.selectNode(result);
	window.getSelection().removeAllRanges();
	result.remove()
}

function cutElm(){
	let result = getHighlightedElm()
	createCopy(result)
	const clipboardItemData = {
		['text']: result,
	}
	result.remove()
}

function copyElm(){
	let result = getHighlightedElm()
	createCopy(result)
	const clipboardItemData = {
		['text']: result,
	}
}

function splitElm(){
	let result = getHighlightedElm();
	let parent = result.parentNode
	if (parent.children.length != 1){
		let outer = result.parentNode.innerHTML.split(result.outerHTML);
		let seperated = [outer[0], result.outerHTML, outer[1]];
		let nodesFragment = document.createDocumentFragment();
		for (let n of seperated){
			let elmContainer = document.createElement("div");
			elmContainer.classList.add("elmContainer");
			elmContainer.setAttribute('onclick', 'clickBox(this, event)');
			elmContainer.setAttribute('ondblclick', 'doubleclickBox(this, event)');
			elmContainer.setAttribute('oninput', 'userstuffChnage()');
			elmContainer.setAttribute('contenteditable', 'true');
			elmContainer.innerHTML = n
			nodesFragment.appendChild(elmContainer)
			
		}
		
		if (nodesFragment.firstElementChild.textContent.length == 0){
			nodesFragment.removeChild(nodesFragment.firstElementChild)
		};
		if (nodesFragment.lastElementChild.textContent.length == 0){
			nodesFragment.removeChild(nodesFragment.lastElementChild)
		};
		parent.replaceWith(nodesFragment);
	}
}

function insertUnList(){
	document.execCommand('insertUnorderedList')
}

function insertOrdList(){
	document.execCommand('insertOrderedList')
}

function saveHTML(){
	let clone = userstuff.cloneNode(true)
	let elmContainers = clone.getElementsByClassName("elmContainer")
	
	Array.prototype.forEach.call(clone.querySelectorAll('*'), element => {
		if (element.getAttribute("contenteditable")){
			element.removeAttribute("contenteditable")
		}
		if (element.getAttribute("style") == "text-align: center"){
				element.removeAttribute("style")
				element.align = "center"
		}
		if (element.getAttribute("style") == "text-align: right"){
			element.removeAttribute("style")
			element.align = "right"
		}
	
		classes = element.className
		if (classes.includes("richtext")){
			element.classList.remove("richtext")
		};
		if (classes.includes("elmContainer")){
			element.classList.remove("elmContainer")
			element.removeAttribute("onclick")
		}
		if (classes.includes("highlighter")){
			element.classList.remove("highlighter")
		}
		
		if (element.classList.length == 0){
			element.removeAttribute("class")
		}
	});
	//let checked = formatForAo3(clone)
	clone.classList.remove("userstuff")
	clone.classList.remove("userstuff")
	childNodes = clone.children
	let htmlString = ''
	Array.prototype.forEach.call(childNodes, element => {
		htmlString = htmlString + '\n' + element.getHTML()
	});
	navigator.clipboard.writeText(htmlString)
	document.getElementById("outputAo3").value = htmlString.trim()
}

function handleFileSelect() {
  const input = document.getElementById('file-input');
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function() {
  	const parser = new DOMParser();
    const contents = reader.result;
    const doc = parser.parseFromString(contents, "text/html");
    
    let css = doc.getElementById("userstyle").innerHTML
    if (htmlDoc.getElementById("userstyle") == null){
		let style = htmlDoc.createElement("style")
		
		style.id = "userstyle"
		style.innerHTML = css
		
		let head = htmlDoc.getElementsByTagName("head")[0]
		htmlDoc.getElementsByTagName("html")[0].insertBefore(style, head)
	} else {
		let stylesheet = htmlDoc.getElementById("userstyle")
		stylesheet.innerHTML = css
	}
	
	let newuserstuff = doc.getElementsByClassName("userstuff")[0]
	userstuff.remove()
	workskin.appendChild(newuserstuff)
	userstuff = htmlFrame.contentWindow.document.getElementsByClassName("userstuff")[0]
	
	let userstyle = htmlFrame.contentWindow.document.getElementById("userstyle")
	let cssTextArea = document.getElementById("cssCode")
	cssTextArea.value = userstyle.innerHTML
	
	let elms = userstuff.getElementsByClassName("elmContainer")
	for (let e of elms){
		e.setAttribute('onclick', 'clickBox(this, event)')
		e.setAttribute('ondblclick', 'doubleclickBox(this, event)')
		e.removeAttribute('onkeyup')
		e.setAttribute('oninput', 'userstuffChnage()')
	}
	
	observer.observe(userstuff, config);
	calcWordCount(userstuff, htmlDoc.getElementById("wordcount"))
	
  }; //end of onload function
  
 //Save backup
  savebackups['autosave'] = JSON.stringify([localStorage.getItem('openText'), localStorage.getItem('openCSS')])
  sessionStorage.setItem('backup', JSON.stringify(savebackups))

  //Read file
  reader.readAsText(file);
}


function userstuffChnage(){
	let userstuff = window.document.getElementsByClassName("userstuff")[0];
	//let countervalue = window.document.getElementById("wordcount")
}

function _userstuffChnage(){
	let userstuff = window.document.getElementsByClassName("userstuff")[0];
	let children = userstuff.childNodes
	let wordcount = 0
	for (let child of children){
		let count = child.textContent.split(' ').length
		wordcount = wordcount + count
	}
	
	let countervalue = window.document.getElementById("wordcount")
	countervalue.innerHTML = wordcount
	
	}

function saveIframe(){
	if('showOpenFilePicker' in window){
		FileAcces_saveIframe()
	} else {
		 Backup_saveIframe()
	}
	setResetInterval(false)
	setResetInterval(true)
}

async function FileAcces_saveIframe(){
	let name = document.getElementById("filenameWIP").value
	let opts = {
		suggestedName: name+'.html',
		types: [{
			description: "HTML",
			accept: {
				'text/html': ['.html'],
			},
		}],
	};

	let clone = htmlDoc.cloneNode(true).firstElementChild;
	file = new Blob([clone.outerHTML], { type: 'text/html' });
	
	let filehandle =  await window.showSaveFilePicker(opts);
	let stream = await filehandle.createWritable();
	await stream.write(file);
	await stream.close();
}

function Backup_saveIframe(){
	let clone = htmlDoc.cloneNode(true).firstElementChild
	
	const link = document.createElement("a");
	file = new Blob([clone.outerHTML], { type: 'text/html' });
	link.href = URL.createObjectURL(file);
	
	let name = document.getElementById("filenameWIP").value
	link.download = name;
	link.click();
	URL.revokeObjectURL(link.href);
}

var htmlSelect = null

function htmlView(){
	let htmlEdit = document.getElementById("htmlPopUp")
	let htmlContent = document.getElementById("popupContent")
	if (window.getSelection().anchorNode != null){
		htmlEdit.style.display = "flex"
		let selected = window.getSelection().anchorNode.parentNode;
		
		var els = [];
		while (selected) {
			els.unshift(selected);
			selected = selected.parentNode;
		};
		for (let e of els){
			if (e.className != undefined){
				let firstClass = e.className.split(' ')[0]
				let s = ''
				if (firstClass == 'elmContainer'){
					indx = els.indexOf(e)
					let nextNode = els[indx+1]
					htmlSelect = nextNode
					let result = process(nextNode.outerHTML);
					//let r = result.split('\n')
					
					let res = result.split('\n').filter(item => item.trim().length !== 0 && item !== null && item !== undefined);
					for (r of res){
						s = s + r + '\n'
					}
					htmlContent.value = s;
					updateHTMLview(s)
					}
				}
			}
	}
}


function updateHTMLview(text){
  var code = escapeHtml(document.getElementById('popupContent').value);
  document.getElementById('highlighting-content').innerHTML = code;
  let set = document.querySelectorAll("code[data-highlighted=yes]")
  for (let s of set){
	s.removeAttribute("data-highlighted")
  }
  hljs.highlightAll();
}


function sync_scroll(element) {
  /* Scroll result to scroll coords of event - sync with textarea */
  let result_element = document.getElementById("highlighting");
  // Get and set x and y
  result_element.scrollTop = element.scrollTop;
  result_element.scrollLeft = element.scrollLeft;
}


function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}



function closeHTMLview(){
	
	let htmlEdit = document.getElementById("htmlPopUp");
	let htmlContent = document.getElementById("popupContent");
	
	if (htmlSelect != null){
		const newDiv = document.createElement("div");
	
		newDiv.innerHTML = htmlContent.value
		htmlSelect.replaceWith(newDiv.firstElementChild)
	}
	htmlContent.value = ''
	htmlEdit.removeAttribute("style")
	htmlSelect = null
}


function process(str) {
    var div = document.createElement('div');
    div.innerHTML = str.trim();

    return format(div, 0).innerHTML;
}

function format(node, level) {

    var indentBefore = new Array(level++ + 1).join('  '),
        indentAfter  = new Array(level - 1).join('  '),
        textNode;

    for (var i = 0; i < node.children.length; i++) {

        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        format(node.children[i], level);

        if (node.lastElementChild == node.children[i]) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode);
        }
    }

    return node;
}

function clickDetails(elm){
	if (elm.hasAttribute('open') && elm.parentNode.hasAttribute('style')){
		elm.parentNode.removeAttribute('style')
	}
}

function newDocument(){
	let lastDoc = localStorage.getItem('openText')
	let lastCSS = localStorage.getItem('openCSS')
	savebackups['autosave'] = JSON.stringify([lastDoc, lastCSS])
	sessionStorage.setItem('backup', JSON.stringify(savebackups))

	localStorage.removeItem('openCSS')
	userstuff.innerHTML = ''
	cssCode.value = ''
	htmlDoc.getElementById("userstyle").innerHTML = ''
}

function webSave(){
	let name = document.getElementById("filenameWIP").value
	if (name.length == 0){
		name = 'Untitled'
	}

	let savedFiles = document.getElementById('filewindow').querySelectorAll('.webFileName')
	let savedFileNames = []
	for (let s of savedFiles){
		savedFileNames.push(s.textContent)
	}


	if (savedFileNames.includes(name)){
		let msg = "A work with this name already exists, are you sure you want to overide it?"
		if (confirm(msg)) {
			savebackups[name] = localStorage.getItem(name)
			sessionStorage.setItem('backup', JSON.stringify(savebackups))
	} else {
		return;
	}
	}

	let docCSS = htmlDoc.getElementById("userstyle").innerHTML
	let docContent = userstuff.innerHTML
	let stringData = JSON.stringify([docContent, docCSS, 'LiveDraftWork'])
	localStorage.setItem(name, stringData)
	
	if (!savedFileNames.includes(name)){
		let filetemplate = fileTemp.content.cloneNode(true).firstElementChild;
		filetemplate.getElementsByClassName("webFileName")[0].innerHTML = name
		filewindow.appendChild(filetemplate)
	}
}

const isValidJSON = str => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

function viewFiles(){
	const fileviewer = document.getElementById("filespopup")
	if (fileviewer.classList.contains("isclosed")){
		fileviewer.classList.remove("isclosed")
	} else {
		fileviewer.classList.add("isclosed")
	}

}

function loadWebFile(elm){
	const fileName = elm.parentNode.parentNode.firstElementChild.textContent
	let fileData = JSON.parse(localStorage.getItem(fileName))
	let textData = fileData[0]
	let CSSData = fileData[1]

	userstuff.innerHTML = textData
	cssCode.value = CSSData
	htmlDoc.getElementById('userstyle').innerHTML = CSSData
	document.getElementById("filenameWIP").value = fileName
	closefilewindow()
}

function deleteWebFile(elm){
	const fileName = elm.parentNode.parentNode.firstElementChild.textContent
	let msg = "Are you sure you want to delete " + fileName + "?"
	if (confirm(msg)) {
		elm.parentNode.parentNode.remove()
		savebackups[fileName] = localStorage.getItem(fileName)
		sessionStorage.setItem('backup', JSON.stringify(savebackups))
		localStorage.removeItem(fileName)
	} else {
	}
}

function restoreDeleted(){
	let backup = JSON.parse(sessionStorage.getItem('backup'))
	let keys = Object.keys(backup)
	let filesExist = Object.keys(localStorage)
	const curDate = Date.now().toString()
	for (let k of keys){
		let rName = ''
		if (filesExist.includes(k)){
			rName = k + curDate
		} else {
			rName = k
		}
		localStorage.setItem(rName, backup[k])
		let filetemplate = fileTemp.content.cloneNode(true).firstElementChild;
		filetemplate.getElementsByClassName("webFileName")[0].innerHTML = rName
		filewindow.appendChild(filetemplate)

	}
}



function generateRandomString(length) {
   const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   let result = "";

   for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
   }

   return result;
}

function copyCSS(elm){
	const fileName = elm.parentNode.parentNode.firstElementChild.textContent
	let fileData = JSON.parse(localStorage.getItem(fileName))
	let CSSData = fileData[1]
	navigator.clipboard.writeText(CSSData)
}

function closefilewindow(){
	const fileviewer = document.getElementById("filespopup")
	fileviewer.classList.add("isclosed")
}

function _filterFiles() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('fileSearch');
  filter = input.value.toUpperCase();
  ul = document.getElementById("filelist");
  li = ul.getElementsByClassName('fileNameContainer');

  for (i = 0; i < li.length; i++) {
    a = li[i].firstElementChild;
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) < -1) {
      li[i].style.display = "auto";
    } else {
      li[i].style.display = "none";
    }
  }
}

function filterFiles() {
	let cards = document.getElementsByClassName('webFileName');
    let search_query = document.getElementById('fileSearch').value;
    for (var i = 0; i < cards.length; i++) {
        if(cards[i].innerText.toLowerCase()
                .includes(search_query.toLowerCase())) {
            cards[i].parentNode.classList.remove("is-hidden");
        } else {
            cards[i].parentNode.classList.add("is-hidden");
        }
    }
}

function showtooltip(bool){
	let tooltip = document.getElementById('helptooltip')
	if (bool){
		tooltip.style.visibility = 'visible'
		tooltip.style.opacity = 1
	} else {
		tooltip.removeAttribute('style')
	}
}
