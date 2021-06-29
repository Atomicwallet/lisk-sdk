"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = exports.getConfig = void 0;
const React = require("react");
const lisk_client_1 = require("@liskhq/lisk-client");
const logo_svg_1 = require("./logo.svg");
const illustration_svg_1 = require("./illustration.svg");
const app_module_scss_1 = require("./app.module.scss");
const { validateBase32Address, getAddressFromBase32Address } = lisk_client_1.cryptography;
const validateAddress = (address, prefix) => {
    try {
        return validateBase32Address(address, prefix);
    }
    catch (error) {
        return false;
    }
};
const defaultFaucetConfig = {
    amount: '10000000000',
    applicationUrl: 'ws://localhost:8080/ws',
    tokenPrefix: 'lsk',
};
const getConfig = async () => {
    if (process.env.NODE_ENV === 'development') {
        return defaultFaucetConfig;
    }
    const apiResponse = await fetch('/api/config');
    const result = await apiResponse.json();
    return result;
};
exports.getConfig = getConfig;
const WarningIcon = () => React.createElement("span", { className: `${app_module_scss_1.default.icon} ${app_module_scss_1.default.warning}` }, "\uE8B2");
const SuccessDialog = props => {
    return (React.createElement("div", { className: `${app_module_scss_1.default.dialogRoot} ${props.open ? app_module_scss_1.default.dialogOpen : app_module_scss_1.default.dialogClose}` },
        React.createElement("div", { className: app_module_scss_1.default.dialogBackground },
            React.createElement("div", { className: app_module_scss_1.default.dialogModal },
                React.createElement("div", { className: app_module_scss_1.default.dialogHeader },
                    React.createElement("div", { className: app_module_scss_1.default.dialogHeaderContent }, "Success"),
                    React.createElement("div", { className: app_module_scss_1.default.iconButton, onClick: props.onClose },
                        React.createElement("span", { className: app_module_scss_1.default.icon }, "close"),
                        ";")),
                React.createElement("div", { className: app_module_scss_1.default.dialogBody }, props.children)))));
};
const App = () => {
    var _a;
    const [input, updateInput] = React.useState('');
    const [errorMsg, updateErrorMsg] = React.useState('');
    const [showSuccessDialog, updateShowSuccessDialog] = React.useState(false);
    const [token, updateToken] = React.useState();
    const [recaptchaReady, updateRecaptchaReady] = React.useState(false);
    const [config, setConfig] = React.useState(defaultFaucetConfig);
    React.useEffect(() => {
        const initConfig = async () => {
            const fetchedConfig = await exports.getConfig();
            setConfig({ ...fetchedConfig });
        };
        initConfig().catch(console.error);
    }, []);
    React.useEffect(() => {
        if (config.captchaSitekey === undefined) {
            return () => { };
        }
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        const id = setInterval(() => {
            if (typeof window.grecaptcha !== 'undefined' &&
                typeof window.grecaptcha.render === 'function') {
                clearInterval(id);
                if (recaptchaReady) {
                    return;
                }
                window.grecaptcha.render('recapcha', {
                    sitekey: config.captchaSitekey,
                    callback: (newToken) => updateToken(newToken),
                });
                updateRecaptchaReady(true);
            }
        }, 1000);
        return () => {
            document.body.removeChild(script);
        };
    }, [config]);
    const onChange = (val) => {
        updateInput(val);
        if (val === '') {
            updateErrorMsg('');
        }
    };
    const onSubmit = async () => {
        var _a;
        if (token === undefined) {
            updateErrorMsg('Recaptcha must be checked.');
            return;
        }
        try {
            const client = await lisk_client_1.apiClient.createWSClient(config.applicationUrl);
            await client.invoke('faucet:fundTokens', {
                address: getAddressFromBase32Address(input, config.tokenPrefix).toString('hex'),
                token,
            });
            updateErrorMsg('');
            updateShowSuccessDialog(true);
        }
        catch (error) {
            updateErrorMsg((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Fail to connect to server');
        }
    };
    return (React.createElement("div", { className: app_module_scss_1.default.root },
        React.createElement("header", { className: app_module_scss_1.default.header },
            React.createElement("img", { src: (_a = config.logoURL) !== null && _a !== void 0 ? _a : logo_svg_1.default, className: app_module_scss_1.default.logo, alt: "logo" })),
        React.createElement("section", { className: app_module_scss_1.default.content },
            React.createElement(SuccessDialog, { open: showSuccessDialog, onClose: () => {
                    updateInput('');
                    updateShowSuccessDialog(false);
                } },
                React.createElement("p", null,
                    "Successfully submitted to transfer funds to:",
                    React.createElement("br", null),
                    input,
                    ".")),
            React.createElement("div", { className: app_module_scss_1.default.main },
                React.createElement("h1", null, "All tokens are for testing purposes only"),
                React.createElement("h2", null,
                    "Please enter your address to receive ",
                    config.amount,
                    ' ',
                    config.tokenPrefix.toLocaleUpperCase(),
                    " tokens for free"),
                React.createElement("div", { className: app_module_scss_1.default.inputArea },
                    React.createElement("div", { className: app_module_scss_1.default.input },
                        React.createElement("input", { className: `${errorMsg !== '' ? app_module_scss_1.default.error : ''}`, placeholder: config.faucetAddress, value: input, onChange: e => onChange(e.target.value) }),
                        errorMsg ? React.createElement(WarningIcon, null) : React.createElement("span", null),
                        errorMsg ? React.createElement("span", { className: app_module_scss_1.default.errorMsg }, errorMsg) : React.createElement("span", null)),
                    React.createElement("button", { disabled: !validateAddress(input, config.tokenPrefix) || !recaptchaReady, onClick: onSubmit }, "Receive")),
                React.createElement("div", { id: "recapcha", className: app_module_scss_1.default.capcha }),
                React.createElement("div", { className: app_module_scss_1.default.address },
                    React.createElement("p", null,
                        React.createElement("span", { className: app_module_scss_1.default.addressLabel }, "Faucet address:"),
                        React.createElement("span", { className: app_module_scss_1.default.addressValue }, config.faucetAddress)))),
            React.createElement("div", { className: app_module_scss_1.default.background },
                React.createElement("img", { src: illustration_svg_1.default, className: app_module_scss_1.default.illustration, alt: "illustration" }))),
        React.createElement("footer", null,
            React.createElement("p", { className: app_module_scss_1.default.copyright }, "\u00A9 2021 Lisk Foundation"))));
};
exports.App = App;
//# sourceMappingURL=app.js.map