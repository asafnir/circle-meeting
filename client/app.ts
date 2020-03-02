import { ThorIOClient } from 'thor-io.client-vnext'
import adapter from 'webrtc-adapter';

export class App {
    factory: ThorIOClient.Factory;
    rtcClient: ThorIOClient.WebRTC;

    connect(brokerUrl: string, config: any): ThorIOClient.Factory {




        var url = brokerUrl;
        return new ThorIOClient.Factory(url, ["broker"]);

    }

    constructor() {

        let fullScreenVideo =    document.querySelector(".full")  as HTMLVideoElement;
        let slug = document.querySelector("#slug") as HTMLInputElement;
        let startButton = document.querySelector("button") as HTMLInputElement;
       

        slug.addEventListener("keyup",()=> {

            if(slug.value.length >= 6){
                startButton.disabled = false;
            }else{
                startButton.disabled = true;
            }

        });

        const addRemoteVideo = (mediaStream:MediaStream) => {
            let video = document.createElement("video");
            video.srcObject = mediaStream;
            video.autoplay = true;
            document.querySelector(".remote").append(video);
            document.querySelector(".remote").classList.remove("hide");
          
            video.addEventListener("click",(e:any) => {
                fullScreenVideo.play();
                fullScreenVideo.srcObject = e.target.srcObject;
            });

        }

        const addLocalVideo = (mediaStream:MediaStream) => {
            let video = document.querySelector(".local video") as HTMLVideoElement;
            video.srcObject = mediaStream;          
         
        }

        const rtcConfig = {
            "iceTransports": 'all',
            "rtcpMuxPolicy": "require",
            "bundlePolicy": "max-bundle",
            "iceServers": [
                {
                    "urls": "stun:stun.l.google.com:19302"
                }
            ]
        };

        
        startButton.addEventListener("click", () => {
            startButton.classList.add("hide");
                document.querySelector(".overlay").classList.add("d-none");
                document.querySelector(".join").classList.add("d-none");
              
                this.rtcClient.ChangeContext(slug.value);               
        });
        // if local ws://localhost:1337/     
        this.factory = this.connect("wss://simpleconf.herokuapp.com/", {})

        this.factory.OnClose = (reason: any) => {
            console.error(reason);
        }
        this.factory.OnOpen = (broker: ThorIOClient.Proxy) => {
            console.log("OnOpen", broker)

            this.rtcClient = new ThorIOClient.WebRTC(broker, rtcConfig);

            this.rtcClient.OnLocalStream =  (mediaStream:MediaStream) => {
              
                
            }

            // this will fire when url has a parameter

            this.rtcClient.OnContextConnected = (ctx) => {

            };

            this.rtcClient.OnContextCreated = (ctx) => {

            };

            this.rtcClient.OnContextChanged =  (ctx) => {

            
                this.rtcClient.ConnectContext();
                console.log("looks like we are abut to join a context...",ctx);
            

            }


            this.rtcClient.OnContextDisconnected = (lost) => {
                    console.log("lost c")
            };


            
            this.rtcClient.OnRemoteStream =  (mediaStream:MediaStream, connection:any) => {
                console.log("looks like we got a remote media steam" ,mediaStream);
                addRemoteVideo(mediaStream);

            }

            this.rtcClient.OnContextCreated = function (ctx) {
                console.log("got a context from the broker", ctx);
            
            }

            broker.OnOpen = (ci: any) => {
                console.log("connected to broker");
                // now get a media stream for local
                

                navigator.getUserMedia({ video: true, audio: true }, (mediaStream: MediaStream) => {
                   
                    this.rtcClient.AddLocalStream(mediaStream);
                
                        addLocalVideo(mediaStream);
                  
                           
                },  (err) => {
                    console.error(err);
                });
               


               


            }

            broker.Connect();

            window["T"] = this.rtcClient;
        };



    }

    static getInstance() {
        return new App()
    }

}


document.addEventListener("DOMContentLoaded", () => {

    App.getInstance();



});