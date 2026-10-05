# LiveDraft

__An Ao3 HTML editor designed to make it easy to build, preview and edit fics using *any* custom workskin.__

## Main Features 

+ __Preview and edit Ao3 fics styled using *any* custom css workskin.__
+ __Easily integrate styled HTML elements with normal text.__
+ __Quickly rearrange styled sections.__
+ __Save your work in the browser and locally.__
+ __Export your work as HTML, ready to be pasted straight into Ao3.__
+ __Can be downloaded for offline use.__

## Useage
> [!NOTE]
> I recommend you use Chrome to launch LiveDraft.

🌐 Click [here](https://noteaxe.github.io/livedraft/) to use online.

🖥️ Download the repository as a zip file, go into the docs folder, and click the index.html file to open LiveDraft in your browser.

## TLDR;

<details>
<summary>What is this for?</summary>
   <br>
   <dl>
       <dd>Honestly, this is a tool I made for an audience of one. I like using a mix of styled elements like text messages etc. and prose in my fics and wanted an easy way to:</dd>
        <dd>a) Insert sections of HTML in between chunks of text</dd>
        <dd>b) Preview my work as I edited</dd> 
        <dd>c) Make changes to the text within styled elements whilst editing without having to juggle multiple different documents and 100s of lines of html just to fix a typo</dd>
   </dl>
   <br>
</details>
<details>
<summary>Do I need to understand html/css to use this?</summary>
   <br>
    <dl>
        <dd>You should have a basic grasp of how custom skins on Ao3 work (i.e have written using custom workskins before). Understanding how HTML documents are structured will help make this tool a lot more intuitive. I've linked some general HTML/CSS resources <a href="https://github.com/noteaxe/livedraft/blob/main/README.md#general-html-and-css-resources">here</a>
    </dl>
   <br>
</details>
<details>
<summary>Can I use this to design custom workskins?</summary>
   <br>
   <dl>
       <dd>Theoretically, but the CSS doesn't update live. I normally use FicFormatter to design my workskins.</dd>
   </dl>
   <br>
</details>

## Example Workflow

1. Write plain text portion(s) of your work (this can be done directly in LiveDraft using the 'Add Rich Text Block' option).
2. Create workskin/custom HTML elements however you normally would.
3. Paste the CSS into LiveDraft and add your HTML elements using the 'Add HTML Block' button. 
4. Edit/continue your work.
5. Save your WIP or export it for Ao3.

## Similar Tools

[FicFormatter](https://d2gmcdwlhahrqc.cloudfront.net/) - tool for building and live previewing custom Ao3 workskins.

[Wo3](https://github.com/tbvns/wo3) - open source Ao3 HTML editor with prebuilt templates.

## Disclamers

So I am *not* a tech person. This grew out of a few smaller projects over the course of several months; I never intended to share this when I started making it, but eventually it got to a point where I thought others might find it useful. If you have any tips for improving, then I'm very open to suggestions!

## Guide

### Basics

+ __<ins>Update CSS</ins>__ → Add your workskin and click update to display changes.
+ __<ins>Add HTML Block</ins>__ → Type/paste HTML code into the text box and click the button to add the element to the end of the document. Elements will be displayed in line with the workskin and *should* appear as they would on Ao3.
+ __<ins>Edit Text</ins>__ → Once added, click on any text within your block(s) to start editing.
+ __<ins>Select Blocks</ins>__ → Shift + click to outline section in red. 
+ __<ins>Delete Selected Block</ins>__ → Removes whatever is outlined in red. 
+ __<ins>Move</ins>__ → Use the ↑ and ↓ arrow buttons on the far right to move the outlined section one place up or down the document tree.
+ __<ins>Text Styling</ins>__ → Basic text styling using ctrl/cmd + B/I/U, alignment using the Text Alignment tools.

---

### Saving

+ __<ins>Save WIP</ins>__ → Save work to the browser, accessed by clicking on the 'Works' button.
+ __<ins>Download WIP</ins>__ → Download work as an HTML file that can be reuploaded using the 'Upload WIP' button.
+ __<ins>Export for Ao3</ins>__ → Formats your work for Ao3's HTML editor, automatically copied to your clipboard and prints to the adjacent text box.
+ __<ins>Recover Works</ins>__ → Most accidentally deleted/overwritten works can be recovered until the browser tab is closed.

> [!CAUTION]
> Always keep a local backup of your work.

---

### Element Edit Tools

>[!NOTE]
> For normal copy/paste use ctrl/cmd + c/v.
> However, this behaviour doesn't play well with styled elements (tldr; your cursor won't highlight the outermost tag unless it's flanked on either side by regular text). These tools solve that by selecting the parent (or grandparent, etc.) of the text element at your cursor position.

+ __<ins>✂️</ins>__ → Cut current selection and add to clipboard.
+ __<ins>📑</ins>__ → Copy current selection to clipboard.
+ __<ins>❌</ins>__ → Delete current selection.
+ __<ins>🪚</ins>__ → Split current selection into it's own block.

## General HTML and CSS Resources
[HTML and CSS Essentials](http://w3schools.com/htmlcss/htmlcss_essentials.asp)

[Structure of an HTML Document](https://www.geeksforgeeks.org/html/html-course-structure-of-an-html-document/)

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.


