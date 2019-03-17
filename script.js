class InputMask {
    constructor(inputIdentifier, nullChar, sepChar, from, to) {
        this.input = null;
        this.inputShadow = null;
        this.nullChar = nullChar;
        this.sepChar = sepChar;
        this.monthRules = null;
        this.ranged = null;
        this.from = from;
        this.to = to;

        this.onInit(inputIdentifier);
    }
    onInit(inputIdentifier) {
        this.input = document.getElementById(inputIdentifier);
        if (this.input) {
            this.inputShadow = [null, null, this.sepChar, null, null, this.sepChar, null, null, null, null];
            this.monthRules = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            this.ranged = !!(this.from && this.to && this.from instanceof Date && this.to instanceof Date);

            this._hangEvents();
            this._render();
        } else {
            console.error("Can't find input tag, which identified as '"+ inputIdentifier +"'");
        }
    }
    _hangEvents() {
        this.input.onclick = () => {
            this.input.selectionStart = 0;
            this.input.selectionEnd = 0;
            this.input.onclick = null;
        };
        this.input.onkeydown = key => this._onKeyPress(key);
    }
    _onKeyPress(key) {
        if (new RegExp( /^\d+$/).test(key.key)) {
            this._digitType(key, this.input.selectionStart);
            key.preventDefault();
        } else if (key.key === 'Backspace') {
            this._removeDigit(this.input.selectionStart - 1);
            key.preventDefault();
        } else if (key.key !== 'ArrowLeft' && key.key !== 'ArrowRight' && key.key !== 'Tab' && key.key !== 'F5') {
            key.preventDefault();
        }
    }
    _removeDigit(index) {
        if (index >= 0 && this.inputShadow[index] !== this.sepChar) {
            this.inputShadow[index] = null;
            this._render(index);
        } else if (this.inputShadow[index] === this.sepChar) {
            this._removeDigit(index - 1);
        }
    }
    _digitType(key, index) {
        if (this.inputShadow[index] === null || this.inputShadow[index] === this.sepChar) {
            if (index === 0 && parseInt(key.key) < 4) {
                this._validator(key, index);
            } else if (index === 1) {
                if (this.inputShadow[0] < 3) {
                    this._validator(key, index);
                } else if (this.inputShadow[0] === 3 && parseInt(key.key) < 2) {
                    this._validator(key, index);
                }
            } else if (index === 2) {
                this.input.selectionStart = index + 1;
                this.input.selectionEnd = index + 1;
                this._digitType(key, this.input.selectionStart);
            } else if (index === 3 && parseInt(key.key) < 2) {
                this._validator(key, index);
            } else if (index === 4) {
                if (this.inputShadow[3] > 0 && parseInt(key.key) < 3) {
                    this._validator(key, index);
                } else if (this.inputShadow[3] === 0) {
                    this._validator(key, index);
                }
            } else if (index === 5) {
                this.input.selectionStart = index + 1;
                this.input.selectionEnd = index + 1;
                this._digitType(key, this.input.selectionStart);
            } else if (index === 6) {
                this._validator(key, index);
            } else if (index === 7) {
                this._validator(key, index);
            } else if (index === 8) {
                this._validator(key, index);
            } else if (index === 9) {
                this._validator(key, index);
            }
        }
    }
    _validator(key, index) {
        // Prepare
        this.inputShadow[index] = parseInt(key.key);
        const currentBlock = this._getCurrentBlock(index);
        let dd = null;
        let mm = null;
        let yyyy = null;
        if (this.inputShadow[0] !== null && this.inputShadow[1] !== null) {
            dd = this.inputShadow[0] * 10 + this.inputShadow[1];
        }
        if (this.inputShadow[3] !== null && this.inputShadow[4] !== null) {
            mm = this.inputShadow[3] * 10 + this.inputShadow[4];
        }
        if (this.inputShadow[6] !== null && this.inputShadow[7] !== null && this.inputShadow[8] !== null && this.inputShadow[9] !== null) {
            yyyy = parseInt(this.inputShadow.slice(6, 10).join(''));
        }
        // Validate
        if (currentBlock === 'day') {
            if (dd) {
                if (dd === 29 && mm === 2) {
                    if (yyyy && yyyy % 4 === 0) {
                        this._render(index + 1);
                    } else if (!yyyy) {
                        this._render(index + 1);
                    } else {
                        this.inputShadow[index] = null;
                    }
                } else if (mm && dd <= this.monthRules[mm - 1]) {
                    this._render(index + 1);
                } else if (mm && dd > this.monthRules[mm - 1]) {
                    this.inputShadow[index] = null;
                } else {
                    this._render(index + 1);
                }
            } else {
                this._render(index + 1);
            }
        } else if (currentBlock === 'month') {
            if (mm) {
                if (dd === 29 && mm === 2) {
                    if (yyyy && yyyy % 4 === 0) {
                        this._render(index + 1);
                    } else if (!yyyy) {
                        this._render(index + 1);
                    } else {
                        this.inputShadow[index] = null;
                    }
                } else if (dd && dd <= this.monthRules[mm - 1]) {
                    this._render(index + 1);
                } else if (dd && dd > this.monthRules[mm - 1]) {
                    this.inputShadow[index] = null;
                } else {
                    this._render(index + 1);
                }
            } else {
                this._render(index + 1);
            }
        } else if (currentBlock === 'year') {
            if (yyyy) {
                if (dd === 29 && mm === 2 && yyyy % 4 === 0) {
                    this._render(index + 1);
                } else if (dd === 29 && mm === 2 && yyyy % 4 !== 0) {
                    this.inputShadow[index] = null;
                } else {
                    this._render(index + 1);
                }
            } else {
                this._render(index + 1);
            }
        }
    }
    _getCurrentBlock(index) {
        if (index >= 0 && index < 3) {
            return 'day';
        } else if (index >= 3 && index < 5) {
            return 'month';
        } else if (index > 5) {
            return 'year';
        }
    }
    _render(index) {
        this.input.value = null;
        this.inputShadow.map(char => char === null ? this.input.value += this.nullChar : this.input.value += char);
        this.input.selectionStart = index;
        this.input.selectionEnd = index;
    }
}

const inputMask = new InputMask('input', '_', '/');
