import { BinaryStreamMessage, serialize, Int8Value, Int16Value, Int32Value, Float32Value, Float64Value, Uint8Value, Uint16Value, Uint32Value, StringValue, BinaryStream } from "../../framework/net/BinaryStreamMessage";
import { MainCmd, SUB_CMD_LOBBY } from "../../common/protocol/CmdNetID";

class TestData extends BinaryStream{

    @serialize("value32",Float32Value)
    float32 : number = 32;

    @serialize("value64",Float64Value)
    float64: number = 64;
}

export class TestBinaryMessage extends BinaryStreamMessage {
    mainCmd = MainCmd.CMD_LOBBY;
    subCmd = SUB_CMD_LOBBY.CMD_LOBBY_TEST_BINARY;
    // @serialize("value32",Float32Value)
    // float32 : number = 32;

    // @serialize("value64",Float64Value)
    // float64: number = 64;

    // @serialize("int8",Int8Value)
    // int8: number = 18;

    // @serialize("int16",Int16Value)
    // int16: number = 116;

    // @serialize("int32",Int32Value)
    // int32: number = 132;

    // @serialize("uint8",Uint8Value)
    // uint8: number = 8;

    // @serialize("uint16",Uint16Value)
    // uint16: number = 16;

    // @serialize("uint32",Uint32Value)
    // uint32: number = 32;

    // @serialize("str",StringValue)
    // str : string = "这只是一个测试，你没看错";

    // @serialize("arr",Array,Int8Value)
    // arr : Array<number> = [1,2,3,4,5,6]

    // @serialize("testMap",Map,String,Int32Value)
    // testMap:Map<string,number> = new Map();

    @serialize("user",TestData)
    user : TestData = new TestData();

    constructor(){
        super();
        // this.testMap.set("keyy_1",1);
        // this.testMap.set("keyy_2",2);
        // this.testMap.set("keyy_3",2);
        // this.testMap.set("keyy_4",4);
        // this.testMap.set("keyy_5",5);
    }
}
