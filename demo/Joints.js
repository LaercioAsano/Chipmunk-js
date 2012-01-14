/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
var Joints = function() {
	Demo.call(this);

	var space = this.space;

	var addBall = function(pos, boxOffset)
	{
		var radius = 15;
		var mass = 1;
		var body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0,0))));
		body.setPos(v.add(pos, boxOffset));
		
		var shape = space.addShape(new cp.CircleShape(body, radius, v(0,0)));
		shape.setElasticity(0);
		shape.setFriction(0.7);
		
		return body;
	};

	var addLever = function(pos, boxOffset)
	{
		var mass = 1;
		var a = v(0,  15);
		var b = v(0, -15);
		
		var body = space.addBody(new cp.Body(mass, cp.momentForSegment(mass, a, b)));
		body.setPos(v.add(pos, v.add(boxOffset, v(0, -15))));
		
		var shape = space.addShape(new cp.SegmentShape(body, a, b, 5));
		shape.setElasticity(0);
		shape.setFriction(0.7);
		
		return body;
	};

	var addBar = function(pos, boxOffset)
	{
		var mass = 2;
		var a = v(0,  30);
		var b = v(0, -30);
		
		var body = space.addBody(new cp.Body(mass, cp.momentForSegment(mass, a, b)));
		body.setPos(v.add(pos, boxOffset));
		
		var shape = space.addShape(new cp.SegmentShape(body, a, b, 5));
		shape.setElasticity(0);
		shape.setFriction(0.7);
		
		return body;
	};

	var addWheel = function(pos, boxOffset)
	{
		var radius = 15;
		var mass = 1;
		var body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0,0))));
		body.setPos(v.add(pos, boxOffset));
		
		var shape = space.addShape(new cp.CircleShape(body, radius, v(0,0)));
		shape.setElasticity(0);
		shape.setFriction(0.7);
		shape.group = 1; // use a group to keep the car parts from colliding
		
		return body;
	};

	var addChassis = function(pos, boxOffset)
	{
		var mass = 5;
		var width = 80;
		var height = 30;
		
		var body = space.addBody(new cp.Body(mass, cp.momentForBox(mass, width, height)));
		body.setPos(v.add(pos, boxOffset));
		
		var shape = space.addShape(new cp.BoxShape(body, width, height));
		shape.setElasticity(0);
		shape.setFriction(0.7);
		shape.group = 1; // use a group to keep the car parts from colliding
		
		return body;
	};

	space.iterations = 10;
	space.gravity = v(0, -100);
	space.sleepTimeThreshold = 0.5;
	
	var staticBody = space.staticBody;
	var shape;
	
	for(var y = 480; y >= 0; y -= 120) {
		shape = space.addShape(new cp.SegmentShape(staticBody, v(0,y), v(640,y), 0));
		shape.setElasticity(1);
		shape.setFriction(1);
		shape.layers = NOT_GRABABLE_MASK;
	}

	for(var x = 0; x <= 640; x += 160) {
		shape = space.addShape(new cp.SegmentShape(staticBody, v(x,0), v(x,480), 0));
		shape.setElasticity(1);
		shape.setFriction(1);
		shape.layers = NOT_GRABABLE_MASK;
	}
	
	var boxOffset;
	var body1, body2;
	
	var posA = v( 50, 60);
	var posB = v(110, 60);
	
	var POS_A = function() { return v.add(boxOffset, posA); };
	var POS_B = function() { return v.add(boxOffset, posB); };
	//#define POS_A vadd(boxOffset, posA)
	//#define POS_B vadd(boxOffset, posB)
	
	// Pin Joints - Link shapes with a solid bar or pin.
	// Keeps the anchor points the same distance apart from when the joint was created.
	boxOffset = v(0, 0);
	body1 = addBall(posA, boxOffset);
	body2 = addBall(posB, boxOffset);
	body2.setAngle(Math.PI);
	space.addConstraint(new cp.PinJoint(body1, body2, v(15,0), v(15,0)));
	
	// Slide Joints - Like pin joints but with a min/max distance.
	// Can be used for a cheap approximation of a rope.
	boxOffset = v(160, 0);
	body1 = addBall(posA, boxOffset);
	body2 = addBall(posB, boxOffset);
	body2.setAngle(Math.PI);
	space.addConstraint(new cp.SlideJoint(body1, body2, v(15,0), v(15,0), 20, 40));
	
	// Pivot Joints - Holds the two anchor points together. Like a swivel.
	boxOffset = v(320, 0);
	body1 = addBall(posA, boxOffset);
	body2 = addBall(posB, boxOffset);
	body2.setAngle(Math.PI);
	// cp.PivotJoint(a, b, v) takes it's anchor parameter in world coordinates. The anchors are calculated from that
	// Alternately, specify two anchor points using cp.PivotJoint(a, b, anch1, anch2)
	space.addConstraint(new cp.PivotJoint(body1, body2, v.add(boxOffset, v(80,60))));
	
	// Groove Joints - Like a pivot joint, but one of the anchors is a line segment that the pivot can slide in
	boxOffset = v(480, 0);
	body1 = addBall(posA, boxOffset);
	body2 = addBall(posB, boxOffset);
	space.addConstraint(new cp.GrooveJoint(body1, body2, v(30,30), v(30,-30), v(-30,0)));
	
	// Damped Springs
	boxOffset = v(0, 120);
	body1 = addBall(posA, boxOffset);
	body2 = addBall(posB, boxOffset);
	//space.addConstraint(cpDampedSpringNew(body1, body2, v(15,0), v(-15,0), 20, 5, 0.3f));
	
	// Damped Rotary Springs
	boxOffset = v(160, 120);
	body1 = addBar(posA, boxOffset);
	body2 = addBar(posB, boxOffset);
	// Add some pin joints to hold the circles in place.
	space.addConstraint(new cp.PivotJoint(body1, staticBody, POS_A()));
	space.addConstraint(new cp.PivotJoint(body2, staticBody, POS_B()));
	//space.addConstraint(cpDampedRotarySpringNew(body1, body2, 0, 3000, 60));
	
	// Rotary Limit Joint
	boxOffset = v(320, 120);
	body1 = addLever(posA, boxOffset);
	body2 = addLever(posB, boxOffset);
	// Add some pin joints to hold the circles in place.
	space.addConstraint(new cp.PivotJoint(body1, staticBody, POS_A()));
	space.addConstraint(new cp.PivotJoint(body2, staticBody, POS_B()));
	// Hold their rotation within 90 degrees of each other.
	//space.addConstraint(cpRotaryLimitJointNew(body1, body2, -M_PI_2, M_PI_2));
	
	// Ratchet Joint - A rotary ratchet, like a socket wrench
	boxOffset = v(480, 120);
	body1 = addLever(posA, boxOffset);
	body2 = addLever(posB, boxOffset);
	// Add some pin joints to hold the circles in place.
	space.addConstraint(new cp.PivotJoint(body1, staticBody, POS_A()));
	space.addConstraint(new cp.PivotJoint(body2, staticBody, POS_B()));
	// Ratchet every 90 degrees
	//space.addConstraint(cpRatchetJointNew(body1, body2, 0, M_PI_2));
	
	// Gear Joint - Maintain a specific angular velocity ratio
	boxOffset = v(0, 240);
	body1 = addBar(posA, boxOffset);
	body2 = addBar(posB, boxOffset);
	// Add some pin joints to hold the circles in place.
	space.addConstraint(new cp.PivotJoint(body1, staticBody, POS_A()));
	space.addConstraint(new cp.PivotJoint(body2, staticBody, POS_B()));
	// Force one to sping 2x as fast as the other
	//space.addConstraint(cpGearJointNew(body1, body2, 0, 2));
	
	// Simple Motor - Maintain a specific angular relative velocity
	boxOffset = v(160, 240);
	body1 = addBar(posA, boxOffset);
	body2 = addBar(posB, boxOffset);
	// Add some pin joints to hold the circles in place.
	space.addConstraint(new cp.PivotJoint(body1, staticBody, POS_A()));
	space.addConstraint(new cp.PivotJoint(body2, staticBody, POS_B()));
	// Make them spin at 1/2 revolution per second in relation to each other.
	//space.addConstraint(cpSimpleMotorNew(body1, body2, M_PI));
	
	// Make a car with some nice soft suspension
	boxOffset = v(320, 240);
	var wheel1 = addWheel(posA, boxOffset);
	var wheel2 = addWheel(posB, boxOffset);
	var chassis = addChassis(v(80, 100), boxOffset);
	
	//space.addConstraint(cpGrooveJointNew(chassis, wheel1, v(-30, -10), v(-30, -40), v(0,0)));
	//space.addConstraint(cpGrooveJointNew(chassis, wheel2, v( 30, -10), v( 30, -40), v(0,0)));
	
	//space.addConstraint(cpDampedSpringNew(chassis, wheel1, v(-30, 0), v(0,0), 50, 20, 10));
	//space.addConstraint(cpDampedSpringNew(chassis, wheel2, v( 30, 0), v(0,0), 50, 20, 10));
	
	
};

Joints.prototype = Object.create(Demo.prototype);

addDemo('Joints', Joints);

