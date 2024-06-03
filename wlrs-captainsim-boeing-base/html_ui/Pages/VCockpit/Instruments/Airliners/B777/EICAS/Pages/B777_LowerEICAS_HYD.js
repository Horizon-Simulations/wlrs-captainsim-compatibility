var B777_LowerEICAS_Hyd;
(function (B777_LowerEICAS_Hyd) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
            
        }
        get templateID() { return "B777LowerEICASHydTemplate"; }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            this.isInitialised = true;
            //setInterval(this.updateClock.bind(this), 1000);
            // Call updateAPUData every 0.2 second
        }

        update(_deltaTime) {
        }

        updateHydraulic() {
        }

    }

    B777_LowerEICAS_HYD.Display = Display;
})(B777_LowerEICAS_HYD || (B777_LowerEICAS_HYD = {}));
customElements.define("b777-lower-eicas-hyd", B777_LowerEICAS_HYD.Display);
//# sourceMappingURL=B747_8_LowerEICAS_HYD.js.map
