import Mellowtel from "mellowtel";

(async () => {
    const mellowtel = new Mellowtel("a4a884a8",{
        disableLogs: true,
    })
    await mellowtel.initContentScript();
})();
