// Recommended size of the canvas: 320,240

function playAnimation(name) {
    A_CURRENT = A_ALL_ANIMATIONS[name]
}

let A_ALL_ANIMATIONS = {}

function registerAnimation(name,code) {
    let scene = new AnimationScene()
    code(scene)
    A_ALL_ANIMATIONS[name] = scene.render()
}

let A_CURRENT = []
let A_DELAY = 1
let A_INDEX = 0
let A_CURRENT_STATE = {}
let testingSkip = 0

onEvent('server.tick', event => {
    // if (testingSkip > 0) {
    animationTick(event)
    //    testingSkip--
    // } else if (testingSkip == 0) {
    //    tell("done skipping")
    //    testingSkip--
    // }
})

function objectHasStuff(obj) {
    for (let key in obj) return true
    return false

    // return !obj || Object.keys(obj).length === 0
}

function animationTick(event) {
    A_DELAY--
    if (A_DELAY > 0) return
    if (A_CURRENT.length == 0) return
    if (A_INDEX == A_CURRENT.length) {
        A_CURRENT = []
        A_INDEX = 0
        frame = {}
        for (let imageName in A_CURRENT_STATE) {
            frame[imageName] = {remove:true}
        }
        A_CURRENT_STATE = {}
        event.server.players.forEach(player => player.paint(frame))
        return
    }
    // tell('--------working on frame--------')
    // tell(A_INDEX)
    const input = A_CURRENT[A_INDEX]
    // tell('==input==')
    // tell(Text.prettyPrintNbt(input))

    let frame = {}
    // tell('==A_CURRENT_STATE before==')
    // tell(Text.prettyPrintNbt(A_CURRENT_STATE))
    //merge input into A_CURRENT_STATE AND make starting values for frame
    for (let imageName in input) {
        if (imageName == 'time' || imageName == 'sound') continue
        if (!objectHasStuff(A_CURRENT_STATE[imageName])) {
            A_CURRENT_STATE[imageName] = {x:0,y:0,xv:0,yv:0,w:16,h:16,wv:0,hv:0}
            frame[imageName] = {alignX:'center',alignY:'center',draw:'always'}
        } else {
            frame[imageName] = {}
        }
        for (let key in input[imageName]) {
            A_CURRENT_STATE[imageName][key] = input[imageName][key]
        }
    }
    // tell('==A_CURRENT_STATE after==')
    // tell(Text.prettyPrintNbt(A_CURRENT_STATE))
    //build frame from the changes
    let currentTime = Date.now()/1000
    for (let imageName in input) {
        if (imageName == 'time' || imageName == 'sound') continue
        let currentInput = input[imageName]
        let currentCurrent = A_CURRENT_STATE[imageName]
        if (currentInput.x != undefined || currentInput.xv != undefined) frame[imageName].x = `time()*${currentCurrent.xv*20}+${currentCurrent.x-currentTime*currentCurrent.xv*20}`
        if (currentInput.y != undefined || currentInput.yv != undefined) frame[imageName].y = `time()*${currentCurrent.yv*20}+${currentCurrent.y-currentTime*currentCurrent.yv*20}`
        if (currentInput.w != undefined || currentInput.wv != undefined) frame[imageName].w = `time()*${currentCurrent.wv*20}+${currentCurrent.w-currentTime*currentCurrent.wv*20}`
        if (currentInput.h != undefined || currentInput.hv != undefined) frame[imageName].h = `time()*${currentCurrent.hv*20}+${currentCurrent.h-currentTime*currentCurrent.hv*20}`
        if (currentInput.texture != undefined ) frame[imageName].texture = currentCurrent.texture
        if (currentInput.z != undefined ) frame[imageName].z = currentCurrent.z
        if (currentInput.type != undefined ) frame[imageName].type = currentCurrent.type
        if (currentInput.visible != undefined ) frame[imageName].visible = currentCurrent.visible

        if (currentInput.textLines != undefined ) currentCurrent.textLines = currentInput.textLines
        if (currentCurrent.textLines != undefined ) frame[imageName].textLines = currentCurrent.textLines // not matching the others because kubejs is broken
    }
    // tell('==frame is==')
    // tell(Text.prettyPrintNbt(frame))


    if (input.sound != undefined) input.sound.forEach(sound => {
        event.server.runCommandSilent(`/execute as @a at @s run playsound ${sound} neutral @s`)
        //if (sound.vol == undefined) player.playSound(sound.id)
        //else if (sound.pitch == undefined) player.playSound(sound.id,sound.vol)
        //else player.playSound(sound.id,sound.vol,sound.pitch)
    })
    event.server.players.forEach(player => {
        // if (input.sound != undefined) input.sound.forEach(sound => {
        //     if (sound.vol == undefined) player.playSound(sound.id)
        //     else if (sound.pitch == undefined) player.playSound(sound.id,sound.vol)
        //     else player.playSound(sound.id,sound.vol,sound.pitch)
        // })
        player.paint(frame)
    })
    A_DELAY = input.time
    A_INDEX++
}

// function facts() {
//     tell("\n")
//     tell("------FACTS------")
//     tell("==A_CURRENT==")
//     tell(Text.prettyPrintNbt(A_CURRENT))
//     tell("==A_DELAY==")
//     tell(A_DELAY)
//     tell("==A_INDEX==")
//     tell(A_INDEX)
//     tell("\n")
// }