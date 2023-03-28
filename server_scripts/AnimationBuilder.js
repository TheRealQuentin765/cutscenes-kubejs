function AnimationScene() {
	this.time = 0
	this.animation = []
	this.idMaker = 0
	this.skip = false
}
AnimationScene.prototype = {
	delay: function (amount) {
		if (this.skip) this.time += 1
		else this.time += amount
	},
	render: function () {
		let output = []
		if (this.animation[0] == undefined) output.push({})
		let space = 0
		for (let index = 0; index < this.animation.length; index++) {
			let item = this.animation[index]
			if (item == undefined) space++
			else {
				if (space != 0) output[output.length-1].time = space + 1
				output.push(item)
				space = 0
			}
		}
		output[output.length-1].time = Math.max(this.time - this.animation.length + 1, 0)
		return output
	},
	newImage: function (texture) {
		this.idMaker++
		return new AnimationImage(this,this.idMaker,texture)
	},
	newText: function (text) {
		this.idMaker++
		return new AnimationText(this,this.idMaker,text)
	},
	add: function(element,what) {
		this.addWhen(element,what,0)
	},
	addWhen: function(element,what,when) {
		if (this.skip && when >1) return this.addWhen(element,what,1)

		if (this.animation[this.time + when] == undefined) this.animation[this.time + when] = {}

		if (typeof what != "object") {
			this.animation[this.time + when][element] = what
			return
		}

		if (this.animation[this.time + when][element] == undefined) this.animation[this.time + when][element] = {}
		//shallow merging (too lazy to implement deep)
		for (let key in what) {
			this.animation[this.time + when][element][key] = what[key]
		}
	},
	sound: function(sound) {
		if (this.animation[this.time] == undefined) this.animation[this.time] = {}
		if (this.animation[this.time].sound == undefined) this.animation[this.time].sound = []
		this.animation[this.time].sound.push(sound)
	},
	skipDelay: function(state) {
		this.skip = state
	}
}



function AnimationObject(scene,id) {
	this.id = id
	this.scene = scene
	this.x = 0
	this.y = 0
	this.w = 0
	this.h = 0
	this.isVisible = true
}

AnimationObject.prototype.goTo = function(x,y) {
	if (x != this.x) {
		this.scene.add(this.id,{x:x})
		this.x = x
	}
	if (y != this.y) {
		this.scene.add(this.id,{y:y})
		this.y = y
	}
}
AnimationObject.prototype.goToOver = function(x,y,time) {
	if (x != this.x) {
		this.scene.addWhen(this.id,{x:x,xv:0},time)
		this.scene.add(this.id,{xv:(x-this.x)/time})
		this.x = x
	}
	if (y != this.y) {
		this.scene.addWhen(this.id,{y:y,yv:0},time)
		this.scene.add(this.id,{yv:(y-this.y)/time})
		this.y = y
	}
}
AnimationObject.prototype.size = function(w,h) {
	if (w != this.w) {
		this.scene.add(this.id,{w:w})
		this.w = w
	}

	if (h == undefined) h = w

	if (h != this.h) {
		this.scene.add(this.id,{h:h})
		this.h = h
	}
}
AnimationObject.prototype.sizeOver = function(w,h,time) {
	if (w != this.w) {
		this.scene.addWhen(this.id,{w:w,wv:0},time)
		this.scene.add(this.id,{wv:(w-this.w)/time})
		this.w = w
	}
	if (h != this.h) {
		this.scene.addWhen(this.id,{h:h,hv:0},time)
		this.scene.add(this.id,{hv:(h-this.h)/time})
		this.h = h
	}
}
AnimationObject.prototype.visible = function(state) {
	if (this.isVisible == state) return
	this.isVisible = state
	this.scene.add(this.id,{visible:this.isVisible})
}
AnimationObject.prototype.showHide = function(time) {
	if (!this.isVisible) this.scene.add(this.id,{visible:true})
	this.isVisible = false
	this.scene.addWhen(this.id,{visible:false},time)
}
AnimationObject.prototype.z = function(val) {
	this.scene.add(this.id,{z:val})
}



// how to extend a class using prototype in js
// https://youtu.be/Fsp42zUNJYU
function AnimationImage(scene,id,texture) {
	AnimationObject.apply(this,[scene,id])
	this.scene.add(id,{type:"rectangle",texture:texture})
}
AnimationImage.prototype = Object.create(AnimationObject.prototype)

AnimationImage.prototype.setTexture = function(texture) {
	this.scene.add(this.id,{texture:texture})
}




function AnimationText(scene,id,text) {
	AnimationObject.apply(this,[scene,id])
	this.scene.add(id,{type:"text",textLines:text})
	this.z(10)
}
AnimationText.prototype = Object.create(AnimationObject.prototype)

AnimationText.prototype.setText = function(text) {
	this.scene.add(this.id,{textLines:text})
}