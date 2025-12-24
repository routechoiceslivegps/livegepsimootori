/* gps-encoding.js 2025-02-28 */
const intValCodec = (function () {
  const decodeUnsignedValueFromString = function (encoded, offset) {
      const enc_len = encoded.length;
      let s = 0;
      let result = 0;
      let b = 0x20;
      let i = offset;
      while (b >= 0x20 && i < enc_len) {
        b = encoded.charCodeAt(i) - 63;
        i += 1;
        result |= (b & 0x1f) << s;
        s += 5;
      }
      return [result, i];
    },
    /*
    decodeLargeUnsignedValueFromString = function (encoded, offset) {
      const enc_len = encoded.length;
      let i = 0;
      let s = 0;
      let result = BigInt("0");
      let b = 0x20;
      while (b >= 0x20 && i + offset < enc_len) {
        b = encoded.charCodeAt(i + offset) - 63;
        i += 1;
        result |= (BigInt(b & 0x1f) << BigInt(s));
        s += 5;
      }
      return [result, i];
    },*/
    decodeSignedValueFromString = function (encoded, offset) {
      const [result, newOffset] = decodeUnsignedValueFromString(encoded, offset);
      if (result & 1) {
        return [~(result >>> 1), newOffset];
      } else {
        return [result >>> 1, newOffset];
      }
    };
  return {
    decodeUnsignedValueFromString,
    decodeSignedValueFromString,
  };
})();

const spericalMercator = (function() {
  const earthRadius = 6371000;
  const MaxLatitude = 85.0511287798;
  const oneRadian  = Math.PI / 180;

  const project = function (pos) {
    const R = earthRadius,
      d = oneRadian,
      max = MaxLatitude,
      lat = Math.max(Math.min(max, pos[1]), -max),
      sin = Math.sin(lat * d);
    return [R * pos[2] * d, R * Math.log((1 + sin) / (1 - sin)) / 2];
  }

  const unproject = function(x, y) {
    const R = earthRadius,
      d = oneRadian;

    return [
      (2 * Math.atan(Math.exp(y / R)) - (Math.PI / 2)) / d,
      x / d / R
    ];
  }

  return {
    project,
    unproject,
  };
})();

const getDistanceBetween = function (pos1, pos2) {
	const R = 6371000,
    rad = Math.PI / 180,
    lat1 = pos1[1] * rad,
  	lat2 = pos2[1] * rad,
  	sinDLat = Math.sin((pos2[1] - pos1[1]) * rad / 2),
  	sinDLon = Math.sin((pos2[2] - pos1[2]) * rad / 2),
  	a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
  	c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const positionOnSegmentAtTimestamp = function(a, b, timestamp) {
  const r = (timestamp - a[0]) / (b[0] - a[0]),
    k = 1 - r,
    i = spericalMercator.project(a),
    j = spericalMercator.project(b),
    l = spericalMercator.unproject(j[0] * r + k * i[0], j[1] * r + k * i[1]);
  return [timestamp, l[0], l[1]];
}

function closestPointOnSegment(pLoc, p1Loc, p2Loc) {
  const p = spericalMercator.project(pLoc),
    p1 = spericalMercator.project(p1Loc),
    p2 = spericalMercator.project(p2Loc);

  let x = p1[0],
      y = p1[1],
      dx = p2[0] - x,
      dy = p2[1] - y,
      t;

  const dot = dx * dx + dy * dy;
  if (dot > 0) {
    t = ((p[0] - x) * dx + (p[1] - y) * dy) / dot;
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;

  const tt = p1Loc[0] + (p2Loc[0] - p1Loc[0]) * ((x - p1[0]) / (p2[0] - p1[0] + Number.EPSILON) + (y - p1[1]) / (p2[1] - p1[1] + Number.EPSILON)) / 2,
    ll = spericalMercator.unproject(x, y);
  return [dx * dx + dy * dy, [tt, ll[0], ll[1]]];
}

const PositionArchive = function () {
  let positions = [];
  const _locationOf = function (element, start, end) {
      start = typeof start !== "undefined" ? start : 0;
      end = typeof end !== "undefined" ? end : positions.length - 1;
      const pivot = Math.floor(start + (end - start) / 2);
      if (end - start < 0) {
        return start;
      }
      if (positions[start][0] >= element) {
        return start;
      }
      if (positions[end][0] <= element) {
        return end + 1;
      }
      if (positions[pivot][0] == element) {
        return pivot;
      }
      if (end - start <= 1) {
        return start + 1;
      }
      if (element > positions[pivot][0]) {
        return _locationOf(element, pivot, end);
      } else {
        return _locationOf(element, start, pivot - 1);
      }
  };
  this.slice = function(start, end) {
    return (new PositionArchive()).setData(positions.slice(start, end));
  }
  this.setData = function(d) {
    positions = d;
    return this;
  }
  this.add = function (pos) {
    if (pos === null) {
      return;
    }
    const index = _locationOf(pos[0]);
    if (
      positions.length > 0 &&
      index < positions.length &&
      positions[index][0] === pos[0]
    ) {
      positions[index] = pos;
    } else if (
      positions.length > 0 &&
      index >= positions.length &&
      positions[positions.length - 1][0] === pos[0]
    ) {
      positions[positions.length - 1] = pos;
    } else {
      positions.splice(index, 0, pos);
    }
    return this;
  };

  this.push = function (pos) {
    positions.push(pos);
  };
  this.setIndex = function (i, pos) {
    positions[i] = pos;
  };
  this.setLength = function (l) {
    positions = positions.slice(0, l);
  };

  this.eraseInterval = function (start, end) {
    let indexS = _locationOf(start);
    let indexE = _locationOf(end);
    while (indexS > 0 && positions[indexS - 1][0] >= start) {
      indexS--;
    }
    while (
      indexE < positions.length - 1 &&
      positions[indexE][0] <= end
    ) {
      indexE++;
    }
    positions.splice(indexS, indexE - indexS + 1);
    return this;
  };
  this.getByIndex = function (i) {
    return positions[i];
  };
  this.getPositionsCount = function () {
    return positions.length;
  };
  this.getLastPosition = function() {
    return positions[positions.length - 1];
  }
  this.getArray = function () {
    return positions;
  };
  this.getByTime = function (t) {
    const index = _locationOf(t);
    if (index === 0) {
      return positions[0];
    }
    if (index > positions.length - 1) {
      return positions[positions.length - 1];
    }
    if (positions[index][0] === t) {
      return positions[index];
    } else {
      return positionOnSegmentAtTimestamp(
        positions[index - 1],
        positions[index],
        t
      );
    }
  };
  this.extractInterval = function (t1, t2) {
    let index = _locationOf(t1);
    let i1;
    let i2;
    let result;
    let i1B = false;
    let i2B = false;
    if (index === 0) {
      i1 = 0;
    } else if (index > positions.length - 1) {
      i1 = positions.length - 1;
    } else if (positions[index][0] === t1) {
      i1 = index;
    } else {
      i1B = true;
      i1 = index;
    }
    index = _locationOf(t2);
    if (index === 0) {
      i2 = 0;
    } else if (index > positions.length - 1) {
      i2 = positions.length - 1;
    } else if (positions[index][0] === t2) {
      i2 = index;
    } else {
      i2B = true;
      i2 = index - 1;
    }

    result = this.slice(i1, i2 + 1);
    if (i1B) {
      result.add(
        positionOnSegmentAtTimestamp(
          positions[i1 - 1],
          positions[i1],
          t1
        )
      );
    }
    if (i2B) {
      result.add(
        positionOnSegmentAtTimestamp(
          positions[i2],
          positions[i2 + 1],
          t2
        )
      );
    }
    return result;
  };
  this.hasPointInInterval = function (t1, t2) {
    const i1 = _locationOf(t1);
    const i2 = _locationOf(t2);
    return i1 !== i2;
  };
  this.getDuration = function () {
    if (positions.length <= 1) {
      return 0;
    } else {
      return positions[positions.length - 1][0] - positions[0][0];
    }
  };
  this.getAge = function (now) {
    now = now === null ? +new Date() : now;
    if (positions.length === 0) {
      return 0;
    } else {
      return now - positions[0][0];
    }
  };
  this.distanceUntil = function (timestamp) {
    let result = 0;
    if (this.getPositionsCount() === 0) {
      return 0;
    }
    const npositions = this.extractInterval(positions[0][0], +timestamp);
    const nn = npositions.getPositionsCount();
    for (let i = 0; i < nn - 1; i++) {
      result += getDistanceBetween(npositions.getByIndex(i), npositions.getByIndex(i + 1));
    }
    return result;
  };
  this.totalDistance = function () {
    let distance = 0;
    let prevPosition = null;
    for (const position of positions) {
      if (!Number.isNaN(position[1])) {
        if (prevPosition) {
          distance += getDistanceBetween(position, prevPosition);
        }
			  prevPosition = position;
		  }
    }
    return distance;
  };
  this.decode = function(encoded) {
    positions = [];
    const YEAR2010 = 1262304000; // = Date.parse("2010-01-01T00:00:00Z")/1e3,
    const vals = [YEAR2010, 0, 0];
    const encodedLength = encoded.length;
    let positionCount = 0;
    let dataOffset = 0;
    while (dataOffset < encodedLength) {
      const i = positionCount % 3;
      const decoder = (i === 0 && dataOffset) ? intValCodec.decodeUnsignedValueFromString : intValCodec.decodeSignedValueFromString
      const [decodedValue, newDataOffset] = decoder(encoded, dataOffset);
      vals[i] += decodedValue;
      dataOffset = newDataOffset;
      positions.push([vals[0] * 1e3, vals[1] / 1e5, vals[2] / 1e5]);
      positionCount += 1;
    }
    return this;
  }
  this.closestPointFrom = function (p) {
    let minDistance = Infinity,
        minPoint = positions?.[0],
        p1, p2, pp;
    for (let i = 1; i < positions.length; i++) {
        p1 = positions[i - 1];
        p2 = positions[i];
        const [sqDist, pt] = closestPointOnSegment(p, p1, p2);
        if (sqDist < minDistance) {
          minDistance = sqDist;
          minPoint = pt;
          pp = i
        }
    }
    return minPoint;
  }
};

PositionArchive.fromEncoded = function (encoded) {
  const pts = new PositionArchive();
  pts.decode(encoded)
  return pts;
};
