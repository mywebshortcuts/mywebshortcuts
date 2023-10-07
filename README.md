> Note: There are a lot of basic functionalities missing currently, that's why this project has a lot of scope for contributions, star & watch the repository to stay updated, or follow [@Prakhartiwari0](https://twitter.com/Prakhartiwari0) on Twitter.

![image](https://github.com/prakhartiwari0/my-web-shortcuts/assets/65062036/febd6d27-ed86-4d3c-8e3a-5082babd7ba6)


<h1 align="center"> My Web Shortcuts </h1>

A Browser Extension to create custom keyboard shortcuts on any website. When you click on the Extension icon in the toolbar, you get to select an element to set the shortcut for, and then select the keyboard key to use in order to click on that element. After doing that, just reload the website and you will be able to click on that element just by pressing the key.




# How to Install the extension

> Note: Only Chromium-based browsers like Google Chrome & Brave are supported currently.

<details>
<summary>
Show the Steps
</summary>



1. Clone the repository & Open the folder
   ```bash
   git clone "https://github.com/prakhartiwari0/my-web-shortcuts" && cd my-web-shortcuts
   ```
2. Install the Packages using NPM
    ```bash
    npm i
    ```
3. Start the Development Server
    ```bash
    npm run dev
    ```
4. Drag and upload the newly generated `dist` folder into your Browser
   ![](.github/assets/howToInstallExtensionInChrome.gif)
5. The extension is now installed in the browser, but you need to reload the website to use it. 


</details>



## Features to work on

**Element Selection for a Keyboard Shortcut**
One can select a single or multiple elements with a single keyboard shortcut attached to it. 


- Single Element Clicking: Simply Select an Element to click on.

- Multiple Elements Selection:
   - Select Elements to click in series at desired intervals
   - Select Elements to click conditionally:
     -  1. Click on Next Element if Element doesn't exists.
     -  2. Click on Next Element if Element isn't clickable.
     -  3. Click on this Element if some other Element exists.