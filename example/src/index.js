import React from "react";

import {
  Appear, BlockQuote, Cite, CodePane, Deck, Fill,
  Heading, Image, Layout, Link, ListItem, List, Markdown, Quote, Slide,
  TableHeaderItem, TableItem, TableRow, Table, Text
} from "../../src";

import Socket from "./socket";

import preloader from "../../src/utils/preloader";

import createTheme from "../../src/themes/default";

import Interactive from "../assets/interactive";

import {getUrlParams, setUser, setSuperUser} from "../../src/utils/base";

require("normalize.css");
require("../../src/themes/default/index.css");

const images = {
  city: require("../assets/city.jpg"),
  kat: require("../assets/kat.png"),
  logo: require("../assets/formidable-logo.svg"),
  markdown: require("../assets/markdown.png"),
  christmas: require("../assets/christmas.jpg"),
  colorful: require("../assets/colorful.jpg"),
  logo: require("../assets/adventist-logo.png"),
  grass: require("../assets/grass.jpg"),
  noPhone: require("../assets/no-phone.png"),
  music: require("../assets/music.png"),
  leavesBg: require("../assets/leaves_bg.jpg"),
  grass2Bg: require("../assets/wet_grass.jpg"),
  bible: require("../assets/bible.png"),
  skyBg: require("../assets/blue_sky.jpg"),
  praying: require("../assets/praying1.png"),
  praying1: require("../assets/praying2.png"),
  offering: require("../assets/love_offering.png"),
  bible2: require("../assets/opened_bible.png"),
  desmondBg: require("../assets/desmond_bg.jpg"),
};

preloader(images);

setUser(getUrlParams(window.location.href).user);
setSuperUser(getUrlParams(window.location.href).superUser);


const theme = createTheme({
  primary: "#ff4081"
});

const socket = new Socket(`wss://online-slides.herokuapp.com`);
//const socket = new Socket(`ws://localhost:8000`);

export default class Presentation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      slides: []
    };
    this.slides = [];
    this.getSlides = this.getSlides.bind(this);
  }

  getSlides(){
      return fetch('https://portfolioadmin.amilcruise.com/api/presentation',{
        method: 'GET',
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
      .then((response) => response.json())
      .then((responseJson) => {
        var responseJsonFinal = responseJson.filter(function (item) {
           return !item.hidden;
        });
        responseJsonFinal.sort(function(a, b) {
              return a.order - b.order;
        });
        this.setState({
          slides: responseJsonFinal
        });
      })
      .catch((error) => {
        console.error(error);
      })
  }

  componentWillMount() {
    this.getSlides();
  }

  render() {

    let appearCounter = 0;
    let imageSrc;
    let bgImageSrc;
    if (this.state.slides.length <= 0){
      return false;
    }

    return (
        <Deck transition={["fade"]} transitionDuration={500} progress="none" remote={socket}>
          { this.state.slides.map(function(slide, i){
            
            if(slide.bg_image) {
              bgImageSrc = eval(slide.bg_image).replace("/", "");
            }

            var first;
            slide.items.sort(function(a, b){return a.order-b.order})
            return (<Slide key={slide.id} bgImage={bgImageSrc || images.grass} transition={slide.transition.split(',')} bgColor={slide.bg_color || '#fff'} bgDarken={slide.bg_darken} >
                        {
                          slide.items.map(function(item, i){
                              if(item.src) {
                                imageSrc = eval(item.src).replace("/", "");
                              }
                              
                              if (item.appear){
                                appearCounter++;
                                if (item.item_type == "heading"){
                                  return(
                                      <Appear key={"appear" + appearCounter} fid={appearCounter}>
                                           <Heading key={item.item_type+item.id} size={item.size} textSize={item.textsize} caps={item.caps} fit={item.fit} textColor={item.textcolor} margin={item.margin}>
                                            {item.content}
                                           </Heading>
                                      </Appear>
                                  )
                                }

                                if (item.item_type == "image"){
                                  return (
                                    <Appear key={"appear" + appearCounter} fid={i}>
                                      <Image key={item.item_type+item.id} src={imageSrc} height={item.height} width={item.width} margin={item.margin} />
                                    </Appear>
                                  )
                                }
                                if (item.item_type == "text"){
                                  return (
                                    <Appear key={"appear" + appearCounter} fid={i}>
                                      
                                      <Text key={item.item_type+item.id} textColor={item.textcolor} margin={item.margin} textSize={item.textsize}>
                                        {item.content}
                                      </Text>
                                     
                                    </Appear>
                                  )
                                }
                                
                              } else {
                                  if (item.item_type == "heading") {
                                    return(<Heading key={item.item_type+item.id} size={item.size} textSize={item.textsize} caps={item.caps} fit={item.fit} textColor={item.textcolor} margin={item.margin}>
                                              {item.content}
                                             </Heading>)
                                  }
                                  if (item.item_type == "image"){
                                    return(<Image key={item.item_type+item.id} src={imageSrc} height={item.height} width={item.width} margin={item.margin} />)
                                  }
                                  if (item.item_type == "text"){
                                    return (
                                      <Text key={item.item_type+item.id} textColor={item.textcolor} margin={item.margin} textSize={item.textsize}>
                                        {item.content}
                                      </Text>
                                    )
                                  }

                              }
                          })
                        } 
                    </Slide>
                    )
          })}
        </Deck>
    );
  }
}
