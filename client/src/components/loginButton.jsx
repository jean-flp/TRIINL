import { ConnectButton } from "thirdweb/react";

export function CustomThemeButton() {
    return (
        <div className="flex flex-col items-center mb-20 md:mb-20">
            <p  className="text-zinc-300 text-base mb-4 md:mb-4">Customize Button Theme</p>
            <ConnectButton
                //Customize button theme
                theme={darkTheme({
                    colors: {
                        primaryText: "#F6F8FF",
                        secondaryText: "#2B333D",
                        accentText: "#F6F8FF",
                        modalOverlayBg: "#DAE8FC",
                        modalBg: "#010101",
                        accentButtonBg: "#2469DA",
                        accentButtonText: "#F6F8FF",
                        secondaryButtonBg: "#010101",
                        secondaryButtonText: "#F6F8FF",
                        secondaryButtonHoverBg: "#2469DA",
                        separatorLine: "#2B333D",
                        borderColor: "#2B333D",

                        primaryButtonBg: "#2469DA",
                        primaryButtonText: "#F6F8FF",

                        connectedButtonBg: "#010101",
                        connectedButtonBgHover: "#2469DA",
                    },
                    //Customize font
                    fontFamily: "Arial Black",
                })}
            />
        </div>
    )
}