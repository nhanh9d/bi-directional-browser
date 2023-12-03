import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'bi-directional-browser';
  bc: BroadcastChannel;
  id: string = '';
  sendTime = 0;
  data = '';
  receiveData = { id: '', x: 0, y: 0 };
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private route: ActivatedRoute) {
    // var conf = { iceServers: [{ "urls": "stun:stun.l.google.com:19302" }] };
    // var peerConnection = new RTCPeerConnection(conf);
    // var dataChannel = peerConnection.createDataChannel("test");

    // dataChannel.
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    })
    document.body.style.margin = "0";
    this.bc = new BroadcastChannel("test");

    this.bc.onmessage = (event) => {
      this.receiveData = event.data;
      this.data = `THIS IS browser ${this.receiveData.id} position <br/> x:${this.receiveData.x} y:${this.receiveData.y}`;
    }

    setInterval(() => {
      const x = window.screenX;
      const y = window.screenY;
      this.bc.postMessage({
        id: this.id,
        x,
        y
      })

      const ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

      ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      ctx.lineWidth = 1;

      ctx.fillText(`r: ${ctx.canvas.width / 4} ${ctx.canvas.width * 3 / 4} ${ctx.canvas.width * 3 / 4}`, 10, 30);
      ctx.fillText(`ID: ${this.id}`, 10, 50);
      ctx.fillText(`${window.innerWidth} ${this.canvas.nativeElement.width}`, 10, 70);
      ctx.fillText(`${x} ${this.receiveData.x} ${y} ${this.receiveData.y}`, 10, 90);

      const rectangle = new Path2D();
      rectangle.rect(0,
        0,
        ctx.canvas.height,
        ctx.canvas.height);
      ctx.stroke(rectangle);

      //draw square box if id = 1
      if (this.id === '1') {
        const rectangle = new Path2D();
        rectangle.rect(ctx.canvas.width / 4,
          ctx.canvas.height / 4,
          ctx.canvas.height / 2,
          ctx.canvas.height / 2);
        ctx.stroke(rectangle);
        ctx.fillStyle = "red";
        ctx.strokeStyle = 'red';

        if (this.receiveData) {
          const endPosX = ctx.canvas.width - x + (this.receiveData.x - ctx.canvas.width * 3 / 4);
          const endPosY = ctx.canvas.height / 2 + this.receiveData.y;
          ctx.fillText(`${endPosX} ${ctx.canvas.width} ${this.receiveData.x} ${ctx.canvas.width / 3 * 4}`, 10, 110);

          ctx.beginPath();
          ctx.moveTo(ctx.canvas.width * 3 / 4, ctx.canvas.height / 2);
          ctx.lineTo(endPosX, endPosY);
          ctx.stroke();
        }
      }

      //draw circle box if id = 2
      if (this.id === '2') {
        const startPosX = 0 - (x - ctx.canvas.width * 3 / 4);
        const startPosY = ctx.canvas.height / 2 - (y - this.receiveData.y);
        // const percentX = (ctx.canvas.width - (x - ctx.canvas.width * 3 / 4) * 4) / (ctx.canvas.width);

        ctx.fillStyle = "green";
        ctx.strokeStyle = 'green';
        const circle = new Path2D();
        circle.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.height / 4, 0, 2 * Math.PI);
        ctx.stroke(circle);

        ctx.beginPath();
        ctx.moveTo(startPosX < 0 ? startPosX : 0, startPosY);
        ctx.lineTo(ctx.canvas.width * 1 / 4, ctx.canvas.height / 2);
        ctx.stroke();

        if (x < ctx.canvas.width) {
          ctx.fillText(`${ctx.canvas.width} ${x} ${this.receiveData.x}`, 10, 110);

          ctx.strokeStyle = 'red';
          ctx.beginPath();
          ctx.moveTo(startPosX < 0 ? startPosX : 0, startPosY);
          ctx.lineTo((ctx.canvas.width * 1 / 4), ctx.canvas.height / 2);
          ctx.stroke();

          if (x < ctx.canvas.width * 3 / 4) {

            const rectangle = new Path2D();
            rectangle.rect(ctx.canvas.width / 4 - x,
              ctx.canvas.height / 4 - y,
              ctx.canvas.height / 2,
              ctx.canvas.height / 2);
              ctx.stroke(rectangle);
          }
        }
      }
    }, 1);
  }

  ngOnDestroy(): void {
    this.bc.close();
  }
}