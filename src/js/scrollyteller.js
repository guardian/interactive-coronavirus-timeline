import { supportsSticky, $$, $ } from "./util.js"

class ScrollyTeller {
    constructor(config) {
        this.isMobile = window.innerWidth < 600;
        this.isTablet = window.innerWidth < 780 && window.innerWidth >= 600;
        this.triggerTop = (this.isMobile) ? config.triggerTopMobile : this.isTablet ? config.triggerTopTablet : config.triggerTop
        this.scrollInner = config.parent.querySelector(".scroll-inner");1
        this.scrollText = config.parent.querySelector(".scroll-text");
        this.scrollWrapper = config.parent.querySelector(".scroll-wrapper");
        this.lastScroll = null;
        this.lastI = null;
        this.triggerPoints = [];
        this.textBoxes = [].slice.apply(this.scrollText.querySelectorAll(".scroll-text__inner"));
        this.transparentUntilActive = config.transparentUntilActive;
        this.bigBoxHeight = config.bigBoxHeight
        this.smallBoxHeight = config.smallBoxHeight

        this.divs = $$('.scroll-text__div')


        const noSmallBoxes = document.querySelectorAll('.scroll-text__inner--half').length 
        const noBigBoxes = document.querySelectorAll('.scroll-text__inner').length - noSmallBoxes

        const height = [...document.querySelectorAll('.scroll-text__inner')].map(d => d.getBoundingClientRect().height).reduce((a, b) => a + b) + 500 

        this.scrollWrapper.style.height = height + "px";

        if(this.transparentUntilActive) {
            config.parent.classList.add("transparent-until-active");
        }
    }

    checkScroll() {
        if(this.lastScroll !== window.pageYOffset) {
            const bbox = this.scrollText.getBoundingClientRect();
            if(!supportsSticky) {
                if(bbox.top <= 0 && bbox.bottom >= window.innerHeight) {
                    this.scrollInner.classed("fixed-top", true);
                    this.scrollInner.classed("absolute-bottom", false);
                    this.scrollInner.classed("absolute-top", false);
                } else if(bbox.top <= 0) {
                    this.scrollInner.classed("fixed-top", false);
                    this.scrollInner.classed("absolute-bottom", true);
                    this.scrollInner.classed("absolute-top", false);
                } else {
                    this.scrollInner.classed("fixed-top", false);
                    this.scrollInner.classed("absolute-bottom", false);
                    this.scrollInner.classed("absolute-top", true);
                }
            }
    
            if(bbox.top < (window.innerHeight*(this.triggerTop)) && bbox.bottom > window.innerHeight/2) {
                
                //const i = Math.floor(Math.abs(bbox.top - (window.innerHeight*(this.triggerTop)))/bbox.height*this.textBoxes.length);

                let i = this.divs.findIndex( el => el.getBoundingClientRect().top > this.triggerTop*window.innerHeight ) - 1

                if(i < 0) {

                    if($('.scroll-text__div').getBoundingClientRect().top < 0) {
                        i = 99
                    }
                }

                if(i >= 0 && i !== this.lastI) {
                    this.lastI = i; 

                    this.doScrollAction(i);

                    if(this.transparentUntilActive) {
                        this.textBoxes.forEach((el, j) => {
                            if(j <= i) {
                                el.style.opacity = "1";
                            } else {
                                el.style.opacity = "0.25";
                            }
                        });
                    }
                }
            }
    
            this.lastScroll = window.pageYOffset;
        }
    
        window.requestAnimationFrame(this.checkScroll.bind(this));
    }

    doScrollAction(i) {
        const trigger = this.triggerPoints.find(d => d.num === i);
        if(trigger) {
            trigger.do();
        }
    }

    watchScroll() {
        window.requestAnimationFrame(this.checkScroll.bind(this));
    }

    addTrigger(t) {
        this.triggerPoints.push(t);
    }
}

export default ScrollyTeller