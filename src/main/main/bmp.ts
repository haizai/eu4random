import Util from "./Util"

class BMP {
  buffer!:Buffer
  bfType!:number // 0-1 表示文件类型
  bfSize!:number // 2-5 表示文件的大小
  bfReserved1!:number // 6-7
  bfReserved2!:number // 8-9
  bfOffBits!:number // a-d 4字节的偏移，表示从文件头到位图数据的偏移

  biSize!:number // 0e-11 4字节的偏移，表示从文件头到位图数据的偏移
  biWidth!:number // 12-15 宽
  biHeight!:number // 16-19
  biPlanes!:number //1a-1b
  biBitCount!:number //1c-1d
  biCompression!: number//1e-21
  biSizeImages!:number//22-25
  biXPelsPerMeter!:number//26-29
  biYPelsPerMeter!:number//2a-2d
  biClrUsed!:number//2e-31
  biClrImportant!:number//32-35



  decode(buffer:Buffer) {
    this.buffer = buffer
    this.bfType = this.readByte2()
    this.bfSize = this.readByte4()
    this.bfReserved1 = this.readByte2()
    this.bfReserved2 = this.readByte2()
    this.bfOffBits = this.readByte4()
    this.biSize = this.readByte4()
    this.biWidth = this.readByte4()
    this.biHeight = this.readByte4()
    this.biPlanes = this.readByte2()
    this.biBitCount = this.readByte2()
    this.biCompression = this.readByte4()
    this.biSizeImages = this.readByte4()
    this.biXPelsPerMeter = this.readByte4()
    this.biYPelsPerMeter = this.readByte4()
    this.biClrUsed = this.readByte4()
    this.biClrImportant = this.readByte4()
  }
  private offset:number = 0
  private readByte2():number {
    var ret = this.buffer.readInt16LE(this.offset)
    this.offset+=2
    return ret
  }
  private readByte4():number {
    var ret = this.buffer.readInt32LE(this.offset)
    this.offset+=4
    return ret
  }
  getColorByPosInt(posInt:number):[number,number,number] {
    var pos = posInt*3 + this.bfOffBits
    let b = this.buffer.readUint8(pos)
    let g = this.buffer.readUint8(pos+1)
    let r = this.buffer.readUint8(pos+2)
    return [r,g,b]
  }
  calPosInt(x:number, y:number) {
    return x + y * this.biWidth
  }
  calPos(posInt:number):[number, number] {
    let y = Math.floor(posInt/this.biWidth)
    let x = posInt - y * this.biWidth
    return [x, y]
  }
}

export default BMP