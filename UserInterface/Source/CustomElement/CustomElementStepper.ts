namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class CustomElementStepper extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-stepper", CustomElementStepper, Number);
    public value: number = 0;
    public params: string;

    constructor(_attributes?: CustomElementAttributes) {
      super(_attributes);
      if (_attributes && _attributes["value"])
        this.value = parseFloat(_attributes["value"]);
    }

    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      this.style.fontFamily = "monospace";
      this.tabIndex = 0;

      this.appendLabel();

      let sign: HTMLSpanElement = document.createElement("span");
      sign.textContent = "+";
      this.appendChild(sign);
      for (let exp: number = 2; exp > -4; exp--) {
        let digit: CustomElementDigit = new CustomElementDigit();
        digit.setAttribute("exp", exp.toString());
        this.appendChild(digit);
        if (exp == 0)
          this.innerHTML += ".";
      }
      this.innerHTML += "e";

      let exp: HTMLSpanElement = document.createElement("span");
      exp.textContent = "+0";
      exp.tabIndex = -1;
      exp.setAttribute("name", "exp");
      this.appendChild(exp);

      let input: HTMLInputElement = document.createElement("input");
      input.type = "number";
      input.style.position = "absolute";
      input.style.left = "0px";
      input.style.display = "none";
      this.appendChild(input);

      // input.addEventListener("change", this.hndInput);
      input.addEventListener("blur", this.hndInput);
      this.addEventListener("blur", this.hndFocus);
      this.addEventListener("keydown", this.hndKey);
      this.addEventListener("wheel", this.hndWheel);
    }

    public activateInnerTabs(_on: boolean): void {
      let index: number = _on ? 0 : -1;

      let spans: NodeListOf<HTMLSpanElement> = this.querySelectorAll("span");
      spans[1].tabIndex = index;

      let digits: NodeListOf<CustomElementDigit> = this.querySelectorAll("fudge-digit");
      for (let digit of digits)
        digit.tabIndex = index;
    }

    public openInput(_open: boolean): void {
      let input: HTMLInputElement = <HTMLInputElement>this.querySelector("input");
      if (_open) {
        input.style.display = "inline-block";
        input.value = this.value.toString();
        input.focus();
      } else {
        input.style.display = "none";
      }
    }

    public setValue(_value: number): void {
      this.value = _value;
    }
    public getValue(): number {
      return this.value;
    }

    public getMantissaAndExponent(): number[] {
      let prec: string = this.value.toExponential(6);
      let exp: number = parseInt(prec.split("e")[1]);
      let exp3: number = Math.trunc(exp / 3);
      let mantissa: number = this.value / Math.pow(10, exp3 * 3);
      mantissa = Math.round(mantissa * 1000) / 1000;
      return [mantissa, exp3 * 3];
    }

    public toString(): string {
      let [mantissa, exp]: number[] = this.getMantissaAndExponent();
      let prefixMantissa: string = (mantissa < 0) ? "" : "+";
      let prefixExp: string = (exp < 0) ? "" : "+";
      return prefixMantissa + mantissa.toFixed(3) + "e" + prefixExp + exp;
    }

    private display(): void {
      let [mantissa, exp]: string[] = this.toString().split("e");
      let spans: NodeListOf<HTMLSpanElement> = this.querySelectorAll("span");
      spans[0].textContent = this.value < 0 ? "-" : "+";
      spans[1].textContent = exp;

      let digits: NodeListOf<CustomElementDigit> = this.querySelectorAll("fudge-digit");
      mantissa = mantissa.substring(1);
      mantissa = mantissa.replace(".", "");
      for (let pos: number = 0; pos < digits.length; pos++) {
        let digit: CustomElementDigit = digits[5 - pos];
        if (pos < mantissa.length) {
          let char: string = mantissa.charAt(mantissa.length - 1 - pos);
          digit.textContent = char;
        }
        else
          digit.innerHTML = "&nbsp;";
      }

      console.log(this.value);
    }

    private hndKey = (_event: KeyboardEvent): void => {
      let active: Element = document.activeElement;
      let numEntered: number = _event.key.charCodeAt(0) - 48;

      _event.stopPropagation();

      if (active == this) {
        switch (_event.code) {
          case ƒ.KEYBOARD_CODE.ENTER:
          case ƒ.KEYBOARD_CODE.NUMPAD_ENTER:
          case ƒ.KEYBOARD_CODE.SPACE:
          case ƒ.KEYBOARD_CODE.ARROW_UP:
          case ƒ.KEYBOARD_CODE.ARROW_DOWN:
            this.activateInnerTabs(true);
            (<HTMLElement>this.querySelectorAll("fudge-digit")[2]).focus();
            break;
          case ƒ.KEYBOARD_CODE.F2:
            this.openInput(true);
            break;
        }
        if ((numEntered >= 0 && numEntered <= 9) || _event.key == "-" || _event.key == "+") {
          this.openInput(true);
          this.querySelector("input").value = "";
          // _event.stopImmediatePropagation();
        }
        return;
      }

      // input field overlay is active
      if (active.getAttribute("type") == "number") {
        if (_event.key == ƒ.KEYBOARD_CODE.ENTER || _event.key == ƒ.KEYBOARD_CODE.NUMPAD_ENTER) {
          this.value = Number((<HTMLInputElement>active).value);
          this.display();
          this.openInput(false);
          this.focus();
        }
        return;
      }

      if (numEntered >= 0 && numEntered <= 9) {
        let difference: number = numEntered - Number(active.textContent) * (this.value < 0 ? -1 : 1);
        this.changeDigitFocussed(difference);

        let next: HTMLElement = <HTMLElement>active.nextElementSibling;
        if (next)
          next.focus();
        return;
      }

      if (_event.key == "-" || _event.key == "+") {
        this.value = (_event.key == "-" ? -1 : 1) * Math.abs(this.value);
        this.display();
        return;
      }

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          this.changeDigitFocussed(-1);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.changeDigitFocussed(+1);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          (<HTMLElement>active.previousElementSibling).focus();
          break;
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          let next: HTMLElement = <HTMLElement>active.nextElementSibling;
          if (next)
            next.focus();
          break;
        case ƒ.KEYBOARD_CODE.ENTER:
        case ƒ.KEYBOARD_CODE.NUMPAD_ENTER:
          this.activateInnerTabs(false);
          this.focus();
          break;
        case ƒ.KEYBOARD_CODE.F2:
          this.activateInnerTabs(false);
          this.openInput(true);
          break;
        default:
          break;
      }
    }

    private hndWheel = (_event: WheelEvent): void => {
      let change: number = _event.deltaY < 0 ? +1 : -1;
      this.changeDigitFocussed(change);
    }

    private hndInput = (_event: Event): void => {
      this.openInput(false);
    }

    private hndFocus = (_event: Event): void => {
      if (this.contains(document.activeElement))
        return;

      this.activateInnerTabs(false);
    }

    private changeDigitFocussed(_amount: number): void {
      let digit: Element = document.activeElement;
      if (!this.contains(digit))
        return;

      _amount = Math.round(_amount);
      if (_amount == 0)
        return;

      if (digit == this.querySelector("[name=exp]")) {
        this.value *= Math.pow(10, _amount);
        this.display();
        return;
      }

      let expDigit: number = parseInt(digit.getAttribute("exp"));
      // @ts-ignore (mantissa not used)
      let [mantissa, expValue]: number[] = this.getMantissaAndExponent();

      this.value += _amount * Math.pow(10, expDigit + expValue);

      let expNew: number;
      [mantissa, expNew] = this.getMantissaAndExponent();
      this.shiftFocus(expNew - expValue);
      this.display();
    }

    private shiftFocus(_nDigits: number): void {
      let shiftFocus: Element = document.activeElement;
      if (_nDigits) {
        for (let i: number = 0; i < 3; i++)
          if (_nDigits > 0)
            shiftFocus = shiftFocus.nextElementSibling;
          else
            shiftFocus = shiftFocus.previousElementSibling;

        (<HTMLElement>shiftFocus).focus();
      }
    }
  }
}
