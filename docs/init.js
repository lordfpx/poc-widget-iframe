/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
  var registeredInModuleLoader = false;
  if (typeof define === "function" && define.amd) {
    define(factory);
    registeredInModuleLoader = true;
  }
  if (typeof exports === "object") {
    module.exports = factory();
    registeredInModuleLoader = true;
  }
  if (!registeredInModuleLoader) {
    var OldCookies = window.Cookies;
    var api = (window.Cookies = factory());
    api.noConflict = function () {
      window.Cookies = OldCookies;
      return api;
    };
  }
})(function () {
  function extend() {
    var i = 0;
    var result = {};
    for (; i < arguments.length; i++) {
      var attributes = arguments[i];
      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }
    return result;
  }

  function init(converter) {
    function api(key, value, attributes) {
      var result;
      if (typeof document === "undefined") {
        return;
      }

      // Write

      if (arguments.length > 1) {
        attributes = extend(
          {
            path: "/",
          },
          api.defaults,
          attributes
        );

        if (typeof attributes.expires === "number") {
          var expires = new Date();
          expires.setMilliseconds(
            expires.getMilliseconds() + attributes.expires * 864e5
          );
          attributes.expires = expires;
        }

        try {
          result = JSON.stringify(value);
          if (/^[\{\[]/.test(result)) {
            value = result;
          }
        } catch (e) {}

        if (!converter.write) {
          value = encodeURIComponent(String(value)).replace(
            /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
            decodeURIComponent
          );
        } else {
          value = converter.write(value, key);
        }

        key = encodeURIComponent(String(key));
        key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
        key = key.replace(/[\(\)]/g, escape);

        return (document.cookie = [
          key,
          "=",
          value,
          attributes.expires
            ? "; expires=" + attributes.expires.toUTCString()
            : "", // use expires attribute, max-age is not supported by IE
          attributes.path ? "; path=" + attributes.path : "",
          attributes.domain ? "; domain=" + attributes.domain : "",
          attributes.secure ? "; secure" : "",
        ].join(""));
      }

      // Read

      if (!key) {
        result = {};
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all. Also prevents odd result when
      // calling "get()"
      var cookies = document.cookie ? document.cookie.split("; ") : [];
      var rdecode = /(%[0-9A-Z]{2})+/g;
      var i = 0;

      for (; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        var cookie = parts.slice(1).join("=");

        if (cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }

        try {
          var name = parts[0].replace(rdecode, decodeURIComponent);
          cookie = converter.read
            ? converter.read(cookie, name)
            : converter(cookie, name) ||
              cookie.replace(rdecode, decodeURIComponent);

          if (this.json) {
            try {
              cookie = JSON.parse(cookie);
            } catch (e) {}
          }

          if (key === name) {
            result = cookie;
            break;
          }

          if (!key) {
            result[name] = cookie;
          }
        } catch (e) {}
      }

      return result;
    }

    api.set = api;
    api.get = function (key) {
      return api.call(api, key);
    };
    api.getJSON = function () {
      return api.apply(
        {
          json: true,
        },
        [].slice.call(arguments)
      );
    };
    api.defaults = {};

    api.remove = function (key, attributes) {
      api(
        key,
        "",
        extend(attributes, {
          expires: -1,
        })
      );
    };

    api.withConverter = init;

    return api;
  }

  return init(function () {});
});

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.FloatingUICore = {})));
})(this, function (exports) {
  "use strict";

  /**
   * Custom positioning reference element.
   * @see https://floating-ui.com/docs/virtual-elements
   */

  const sides = ["top", "right", "bottom", "left"];
  const alignments = ["start", "end"];
  const placements = /*#__PURE__*/ sides.reduce(
    (acc, side) =>
      acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]),
    []
  );
  const min = Math.min;
  const max = Math.max;
  const oppositeSideMap = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom",
  };
  const oppositeAlignmentMap = {
    start: "end",
    end: "start",
  };
  function clamp(start, value, end) {
    return max(start, min(value, end));
  }
  function evaluate(value, param) {
    return typeof value === "function" ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }
  function getOppositeAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function getAxisLength(axis) {
    return axis === "y" ? "height" : "width";
  }
  function getSideAxis(placement) {
    return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide =
      alignmentAxis === "x"
        ? alignment === (rtl ? "end" : "start")
          ? "right"
          : "left"
        : alignment === "start"
        ? "bottom"
        : "top";
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [
      getOppositeAlignmentPlacement(placement),
      oppositePlacement,
      getOppositeAlignmentPlacement(oppositePlacement),
    ];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(
      /start|end/g,
      (alignment) => oppositeAlignmentMap[alignment]
    );
  }
  function getSideList(side, isStart, rtl) {
    const lr = ["left", "right"];
    const rl = ["right", "left"];
    const tb = ["top", "bottom"];
    const bt = ["bottom", "top"];
    switch (side) {
      case "top":
      case "bottom":
        if (rtl) return isStart ? rl : lr;
        return isStart ? lr : rl;
      case "left":
      case "right":
        return isStart ? tb : bt;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === "start", rtl);
    if (alignment) {
      list = list.map((side) => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(
      /left|right|bottom|top/g,
      (side) => oppositeSideMap[side]
    );
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding,
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== "number"
      ? expandPaddingObject(padding)
      : {
          top: padding,
          right: padding,
          bottom: padding,
          left: padding,
        };
  }
  function rectToClientRect(rect) {
    const { x, y, width, height } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y,
    };
  }

  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let { reference, floating } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === "y";
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case "top":
        coords = {
          x: commonX,
          y: reference.y - floating.height,
        };
        break;
      case "bottom":
        coords = {
          x: commonX,
          y: reference.y + reference.height,
        };
        break;
      case "right":
        coords = {
          x: reference.x + reference.width,
          y: commonY,
        };
        break;
      case "left":
        coords = {
          x: reference.x - floating.width,
          y: commonY,
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y,
        };
    }
    switch (getAlignment(placement)) {
      case "start":
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case "end":
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a given reference element.
   *
   * This export does not have any `platform` interface logic. You will need to
   * write one for the platform you are using Floating UI with.
   */
  const computePosition = async (reference, floating, config) => {
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform,
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform.isRTL == null
      ? void 0
      : platform.isRTL(floating));
    let rects = await platform.getElementRects({
      reference,
      floating,
      strategy,
    });
    let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const { name, fn } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset,
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform,
        elements: {
          reference,
          floating,
        },
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data,
        },
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === "object") {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects =
              reset.rects === true
                ? await platform.getElementRects({
                    reference,
                    floating,
                    strategy,
                  })
                : reset.rects;
          }
          ({ x, y } = computeCoordsFromPlacement(
            rects,
            statefulPlacement,
            rtl
          ));
        }
        i = -1;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData,
    };
  };

  /**
   * Resolves with an object of overflow side offsets that determine how much the
   * element is overflowing a given clipping boundary on each side.
   * - positive = overflowing the boundary by that number of pixels
   * - negative = how many pixels left before it will overflow
   * - 0 = lies flush with the boundary
   * @see https://floating-ui.com/docs/detectOverflow
   */
  async function detectOverflow(state, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const { x, y, platform, rects, elements, strategy } = state;
    const {
      boundary = "clippingAncestors",
      rootBoundary = "viewport",
      elementContext = "floating",
      altBoundary = false,
      padding = 0,
    } = evaluate(options, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === "floating" ? "reference" : "floating";
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(
      await platform.getClippingRect({
        element: (
          (_await$platform$isEle = await (platform.isElement == null
            ? void 0
            : platform.isElement(element))) != null
            ? _await$platform$isEle
            : true
        )
          ? element
          : element.contextElement ||
            (await (platform.getDocumentElement == null
              ? void 0
              : platform.getDocumentElement(elements.floating))),
        boundary,
        rootBoundary,
        strategy,
      })
    );
    const rect =
      elementContext === "floating"
        ? {
            x,
            y,
            width: rects.floating.width,
            height: rects.floating.height,
          }
        : rects.reference;
    const offsetParent = await (platform.getOffsetParent == null
      ? void 0
      : platform.getOffsetParent(elements.floating));
    const offsetScale = (await (platform.isElement == null
      ? void 0
      : platform.isElement(offsetParent)))
      ? (await (platform.getScale == null
          ? void 0
          : platform.getScale(offsetParent))) || {
          x: 1,
          y: 1,
        }
      : {
          x: 1,
          y: 1,
        };
    const elementClientRect = rectToClientRect(
      platform.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements,
            rect,
            offsetParent,
            strategy,
          })
        : rect
    );
    return {
      top:
        (clippingClientRect.top - elementClientRect.top + paddingObject.top) /
        offsetScale.y,
      bottom:
        (elementClientRect.bottom -
          clippingClientRect.bottom +
          paddingObject.bottom) /
        offsetScale.y,
      left:
        (clippingClientRect.left -
          elementClientRect.left +
          paddingObject.left) /
        offsetScale.x,
      right:
        (elementClientRect.right -
          clippingClientRect.right +
          paddingObject.right) /
        offsetScale.x,
    };
  }

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow = (options) => ({
    name: "arrow",
    options,
    async fn(state) {
      const { x, y, placement, rects, platform, elements, middlewareData } =
        state;
      // Since `element` is required, we don't Partial<> the type.
      const { element, padding = 0 } = evaluate(options, state) || {};
      if (element == null) {
        return {};
      }
      const paddingObject = getPaddingObject(padding);
      const coords = {
        x,
        y,
      };
      const axis = getAlignmentAxis(placement);
      const length = getAxisLength(axis);
      const arrowDimensions = await platform.getDimensions(element);
      const isYAxis = axis === "y";
      const minProp = isYAxis ? "top" : "left";
      const maxProp = isYAxis ? "bottom" : "right";
      const clientProp = isYAxis ? "clientHeight" : "clientWidth";
      const endDiff =
        rects.reference[length] +
        rects.reference[axis] -
        coords[axis] -
        rects.floating[length];
      const startDiff = coords[axis] - rects.reference[axis];
      const arrowOffsetParent = await (platform.getOffsetParent == null
        ? void 0
        : platform.getOffsetParent(element));
      let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;

      // DOM platform can return `window` as the `offsetParent`.
      if (
        !clientSize ||
        !(await (platform.isElement == null
          ? void 0
          : platform.isElement(arrowOffsetParent)))
      ) {
        clientSize = elements.floating[clientProp] || rects.floating[length];
      }
      const centerToReference = endDiff / 2 - startDiff / 2;

      // If the padding is large enough that it causes the arrow to no longer be
      // centered, modify the padding so that it is centered.
      const largestPossiblePadding =
        clientSize / 2 - arrowDimensions[length] / 2 - 1;
      const minPadding = min(paddingObject[minProp], largestPossiblePadding);
      const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);

      // Make sure the arrow doesn't overflow the floating element if the center
      // point is outside the floating element's bounds.
      const min$1 = minPadding;
      const max = clientSize - arrowDimensions[length] - maxPadding;
      const center =
        clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
      const offset = clamp(min$1, center, max);

      // If the reference is small enough that the arrow's padding causes it to
      // to point to nothing for an aligned placement, adjust the offset of the
      // floating element itself. To ensure `shift()` continues to take action,
      // a single reset is performed when this is true.
      const shouldAddOffset =
        !middlewareData.arrow &&
        getAlignment(placement) != null &&
        center !== offset &&
        rects.reference[length] / 2 -
          (center < min$1 ? minPadding : maxPadding) -
          arrowDimensions[length] / 2 <
          0;
      const alignmentOffset = shouldAddOffset
        ? center < min$1
          ? center - min$1
          : center - max
        : 0;
      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offset,
          centerOffset: center - offset - alignmentOffset,
          ...(shouldAddOffset && {
            alignmentOffset,
          }),
        },
        reset: shouldAddOffset,
      };
    },
  });

  function getPlacementList(alignment, autoAlignment, allowedPlacements) {
    const allowedPlacementsSortedByAlignment = alignment
      ? [
          ...allowedPlacements.filter(
            (placement) => getAlignment(placement) === alignment
          ),
          ...allowedPlacements.filter(
            (placement) => getAlignment(placement) !== alignment
          ),
        ]
      : allowedPlacements.filter(
          (placement) => getSide(placement) === placement
        );
    return allowedPlacementsSortedByAlignment.filter((placement) => {
      if (alignment) {
        return (
          getAlignment(placement) === alignment ||
          (autoAlignment
            ? getOppositeAlignmentPlacement(placement) !== placement
            : false)
        );
      }
      return true;
    });
  }
  /**
   * Optimizes the visibility of the floating element by choosing the placement
   * that has the most space available automatically, without needing to specify a
   * preferred placement. Alternative to `flip`.
   * @see https://floating-ui.com/docs/autoPlacement
   */
  const autoPlacement = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "autoPlacement",
      options,
      async fn(state) {
        var _middlewareData$autoP,
          _middlewareData$autoP2,
          _placementsThatFitOnE;
        const { rects, middlewareData, placement, platform, elements } = state;
        const {
          crossAxis = false,
          alignment,
          allowedPlacements = placements,
          autoAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);
        const placements$1 =
          alignment !== undefined || allowedPlacements === placements
            ? getPlacementList(
                alignment || null,
                autoAlignment,
                allowedPlacements
              )
            : allowedPlacements;
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const currentIndex =
          ((_middlewareData$autoP = middlewareData.autoPlacement) == null
            ? void 0
            : _middlewareData$autoP.index) || 0;
        const currentPlacement = placements$1[currentIndex];
        if (currentPlacement == null) {
          return {};
        }
        const alignmentSides = getAlignmentSides(
          currentPlacement,
          rects,
          await (platform.isRTL == null
            ? void 0
            : platform.isRTL(elements.floating))
        );

        // Make `computeCoords` start from the right place.
        if (placement !== currentPlacement) {
          return {
            reset: {
              placement: placements$1[0],
            },
          };
        }
        const currentOverflows = [
          overflow[getSide(currentPlacement)],
          overflow[alignmentSides[0]],
          overflow[alignmentSides[1]],
        ];
        const allOverflows = [
          ...(((_middlewareData$autoP2 = middlewareData.autoPlacement) == null
            ? void 0
            : _middlewareData$autoP2.overflows) || []),
          {
            placement: currentPlacement,
            overflows: currentOverflows,
          },
        ];
        const nextPlacement = placements$1[currentIndex + 1];

        // There are more placements to check.
        if (nextPlacement) {
          return {
            data: {
              index: currentIndex + 1,
              overflows: allOverflows,
            },
            reset: {
              placement: nextPlacement,
            },
          };
        }
        const placementsSortedByMostSpace = allOverflows
          .map((d) => {
            const alignment = getAlignment(d.placement);
            return [
              d.placement,
              alignment && crossAxis
                ? // Check along the mainAxis and main crossAxis side.
                  d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0)
                : // Check only the mainAxis.
                  d.overflows[0],
              d.overflows,
            ];
          })
          .sort((a, b) => a[1] - b[1]);
        const placementsThatFitOnEachSide = placementsSortedByMostSpace.filter(
          (d) =>
            d[2]
              .slice(
                0,
                // Aligned placements should not check their opposite crossAxis
                // side.
                getAlignment(d[0]) ? 2 : 3
              )
              .every((v) => v <= 0)
        );
        const resetPlacement =
          ((_placementsThatFitOnE = placementsThatFitOnEachSide[0]) == null
            ? void 0
            : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
        if (resetPlacement !== placement) {
          return {
            data: {
              index: currentIndex + 1,
              overflows: allOverflows,
            },
            reset: {
              placement: resetPlacement,
            },
          };
        }
        return {};
      },
    };
  };

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "flip",
      options,
      async fn(state) {
        var _middlewareData$arrow, _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform,
          elements,
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = "bestFit",
          fallbackAxisSideDirection = "none",
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);

        // If a reset by the arrow was caused due to an alignment offset being
        // added, we should skip any logic now since `flip()` has already done its
        // work.
        // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
        if (
          (_middlewareData$arrow = middlewareData.arrow) != null &&
          _middlewareData$arrow.alignmentOffset
        ) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform.isRTL == null
          ? void 0
          : platform.isRTL(elements.floating));
        const fallbackPlacements =
          specifiedFallbackPlacements ||
          (isBasePlacement || !flipAlignment
            ? [getOppositePlacement(initialPlacement)]
            : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection =
          fallbackAxisSideDirection !== "none";
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
          fallbackPlacements.push(
            ...getOppositeAxisPlacements(
              initialPlacement,
              flipAlignment,
              fallbackAxisSideDirection,
              rtl
            )
          );
        }
        const placements = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData =
          ((_middlewareData$flip = middlewareData.flip) == null
            ? void 0
            : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides[0]], overflow[sides[1]]);
        }
        overflowsData = [
          ...overflowsData,
          {
            placement,
            overflows,
          },
        ];

        // One or more sides is overflowing.
        if (!overflows.every((side) => side <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex =
            (((_middlewareData$flip2 = middlewareData.flip) == null
              ? void 0
              : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements[nextIndex];
          if (nextPlacement) {
            var _overflowsData$;
            const ignoreCrossAxisOverflow =
              checkCrossAxis === "alignment"
                ? initialSideAxis !== getSideAxis(nextPlacement)
                : false;
            const hasInitialMainAxisOverflow =
              ((_overflowsData$ = overflowsData[0]) == null
                ? void 0
                : _overflowsData$.overflows[0]) > 0;
            if (!ignoreCrossAxisOverflow || hasInitialMainAxisOverflow) {
              // Try next placement and re-run the lifecycle.
              return {
                data: {
                  index: nextIndex,
                  overflows: overflowsData,
                },
                reset: {
                  placement: nextPlacement,
                },
              };
            }
          }

          // First, find the candidates that fit on the mainAxis side of overflow,
          // then find the placement that fits the best on the main crossAxis side.
          let resetPlacement =
            (_overflowsData$filter = overflowsData
              .filter((d) => d.overflows[0] <= 0)
              .sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null
              ? void 0
              : _overflowsData$filter.placement;

          // Otherwise fallback.
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case "bestFit": {
                var _overflowsData$filter2;
                const placement =
                  (_overflowsData$filter2 = overflowsData
                    .filter((d) => {
                      if (hasFallbackAxisSideDirection) {
                        const currentSideAxis = getSideAxis(d.placement);
                        return (
                          currentSideAxis === initialSideAxis ||
                          // Create a bias to the `y` side axis due to horizontal
                          // reading directions favoring greater width.
                          currentSideAxis === "y"
                        );
                      }
                      return true;
                    })
                    .map((d) => [
                      d.placement,
                      d.overflows
                        .filter((overflow) => overflow > 0)
                        .reduce((acc, overflow) => acc + overflow, 0),
                    ])
                    .sort((a, b) => a[1] - b[1])[0]) == null
                    ? void 0
                    : _overflowsData$filter2[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
              case "initialPlacement":
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement,
              },
            };
          }
        }
        return {};
      },
    };
  };

  function getSideOffsets(overflow, rect) {
    return {
      top: overflow.top - rect.height,
      right: overflow.right - rect.width,
      bottom: overflow.bottom - rect.height,
      left: overflow.left - rect.width,
    };
  }
  function isAnySideFullyClipped(overflow) {
    return sides.some((side) => overflow[side] >= 0);
  }
  /**
   * Provides data to hide the floating element in applicable situations, such as
   * when it is not in the same clipping context as the reference element.
   * @see https://floating-ui.com/docs/hide
   */
  const hide = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "hide",
      options,
      async fn(state) {
        const { rects } = state;
        const { strategy = "referenceHidden", ...detectOverflowOptions } =
          evaluate(options, state);
        switch (strategy) {
          case "referenceHidden": {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              elementContext: "reference",
            });
            const offsets = getSideOffsets(overflow, rects.reference);
            return {
              data: {
                referenceHiddenOffsets: offsets,
                referenceHidden: isAnySideFullyClipped(offsets),
              },
            };
          }
          case "escaped": {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              altBoundary: true,
            });
            const offsets = getSideOffsets(overflow, rects.floating);
            return {
              data: {
                escapedOffsets: offsets,
                escaped: isAnySideFullyClipped(offsets),
              },
            };
          }
          default: {
            return {};
          }
        }
      },
    };
  };

  function getBoundingRect(rects) {
    const minX = min(...rects.map((rect) => rect.left));
    const minY = min(...rects.map((rect) => rect.top));
    const maxX = max(...rects.map((rect) => rect.right));
    const maxY = max(...rects.map((rect) => rect.bottom));
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  function getRectsByLine(rects) {
    const sortedRects = rects.slice().sort((a, b) => a.y - b.y);
    const groups = [];
    let prevRect = null;
    for (let i = 0; i < sortedRects.length; i++) {
      const rect = sortedRects[i];
      if (!prevRect || rect.y - prevRect.y > prevRect.height / 2) {
        groups.push([rect]);
      } else {
        groups[groups.length - 1].push(rect);
      }
      prevRect = rect;
    }
    return groups.map((rect) => rectToClientRect(getBoundingRect(rect)));
  }
  /**
   * Provides improved positioning for inline reference elements that can span
   * over multiple lines, such as hyperlinks or range selections.
   * @see https://floating-ui.com/docs/inline
   */
  const inline = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "inline",
      options,
      async fn(state) {
        const { placement, elements, rects, platform, strategy } = state;
        // A MouseEvent's client{X,Y} coords can be up to 2 pixels off a
        // ClientRect's bounds, despite the event listener being triggered. A
        // padding of 2 seems to handle this issue.
        const { padding = 2, x, y } = evaluate(options, state);
        const nativeClientRects = Array.from(
          (await (platform.getClientRects == null
            ? void 0
            : platform.getClientRects(elements.reference))) || []
        );
        const clientRects = getRectsByLine(nativeClientRects);
        const fallback = rectToClientRect(getBoundingRect(nativeClientRects));
        const paddingObject = getPaddingObject(padding);
        function getBoundingClientRect() {
          // There are two rects and they are disjoined.
          if (
            clientRects.length === 2 &&
            clientRects[0].left > clientRects[1].right &&
            x != null &&
            y != null
          ) {
            // Find the first rect in which the point is fully inside.
            return (
              clientRects.find(
                (rect) =>
                  x > rect.left - paddingObject.left &&
                  x < rect.right + paddingObject.right &&
                  y > rect.top - paddingObject.top &&
                  y < rect.bottom + paddingObject.bottom
              ) || fallback
            );
          }

          // There are 2 or more connected rects.
          if (clientRects.length >= 2) {
            if (getSideAxis(placement) === "y") {
              const firstRect = clientRects[0];
              const lastRect = clientRects[clientRects.length - 1];
              const isTop = getSide(placement) === "top";
              const top = firstRect.top;
              const bottom = lastRect.bottom;
              const left = isTop ? firstRect.left : lastRect.left;
              const right = isTop ? firstRect.right : lastRect.right;
              const width = right - left;
              const height = bottom - top;
              return {
                top,
                bottom,
                left,
                right,
                width,
                height,
                x: left,
                y: top,
              };
            }
            const isLeftSide = getSide(placement) === "left";
            const maxRight = max(...clientRects.map((rect) => rect.right));
            const minLeft = min(...clientRects.map((rect) => rect.left));
            const measureRects = clientRects.filter((rect) =>
              isLeftSide ? rect.left === minLeft : rect.right === maxRight
            );
            const top = measureRects[0].top;
            const bottom = measureRects[measureRects.length - 1].bottom;
            const left = minLeft;
            const right = maxRight;
            const width = right - left;
            const height = bottom - top;
            return {
              top,
              bottom,
              left,
              right,
              width,
              height,
              x: left,
              y: top,
            };
          }
          return fallback;
        }
        const resetRects = await platform.getElementRects({
          reference: {
            getBoundingClientRect,
          },
          floating: elements.floating,
          strategy,
        });
        if (
          rects.reference.x !== resetRects.reference.x ||
          rects.reference.y !== resetRects.reference.y ||
          rects.reference.width !== resetRects.reference.width ||
          rects.reference.height !== resetRects.reference.height
        ) {
          return {
            reset: {
              rects: resetRects,
            },
          };
        }
        return {};
      },
    };
  };

  // For type backwards-compatibility, the `OffsetOptions` type was also
  // Derivable.

  async function convertValueToCoords(state, options) {
    const { placement, platform, elements } = state;
    const rtl = await (platform.isRTL == null
      ? void 0
      : platform.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === "y";
    const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state);

    // eslint-disable-next-line prefer-const
    let { mainAxis, crossAxis, alignmentAxis } =
      typeof rawValue === "number"
        ? {
            mainAxis: rawValue,
            crossAxis: 0,
            alignmentAxis: null,
          }
        : {
            mainAxis: rawValue.mainAxis || 0,
            crossAxis: rawValue.crossAxis || 0,
            alignmentAxis: rawValue.alignmentAxis,
          };
    if (alignment && typeof alignmentAxis === "number") {
      crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical
      ? {
          x: crossAxis * crossAxisMulti,
          y: mainAxis * mainAxisMulti,
        }
      : {
          x: mainAxis * mainAxisMulti,
          y: crossAxis * crossAxisMulti,
        };
  }

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset = function (options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: "offset",
      options,
      async fn(state) {
        var _middlewareData$offse, _middlewareData$arrow;
        const { x, y, placement, middlewareData } = state;
        const diffCoords = await convertValueToCoords(state, options);

        // If the placement is the same and the arrow caused an alignment offset
        // then we don't need to change the positioning coordinates.
        if (
          placement ===
            ((_middlewareData$offse = middlewareData.offset) == null
              ? void 0
              : _middlewareData$offse.placement) &&
          (_middlewareData$arrow = middlewareData.arrow) != null &&
          _middlewareData$arrow.alignmentOffset
        ) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement,
          },
        };
      },
    };
  };

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "shift",
      options,
      async fn(state) {
        const { x, y, placement } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = false,
          limiter = {
            fn: (_ref) => {
              let { x, y } = _ref;
              return {
                x,
                y,
              };
            },
          },
          ...detectOverflowOptions
        } = evaluate(options, state);
        const coords = {
          x,
          y,
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const crossAxis = getSideAxis(getSide(placement));
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === "y" ? "top" : "left";
          const maxSide = mainAxis === "y" ? "bottom" : "right";
          const min = mainAxisCoord + overflow[minSide];
          const max = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = clamp(min, mainAxisCoord, max);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === "y" ? "top" : "left";
          const maxSide = crossAxis === "y" ? "bottom" : "right";
          const min = crossAxisCoord + overflow[minSide];
          const max = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = clamp(min, crossAxisCoord, max);
        }
        const limitedCoords = limiter.fn({
          ...state,
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord,
        });
        return {
          ...limitedCoords,
          data: {
            x: limitedCoords.x - x,
            y: limitedCoords.y - y,
            enabled: {
              [mainAxis]: checkMainAxis,
              [crossAxis]: checkCrossAxis,
            },
          },
        };
      },
    };
  };
  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  const limitShift = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      options,
      fn(state) {
        const { x, y, placement, rects, middlewareData } = state;
        const {
          offset = 0,
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
        } = evaluate(options, state);
        const coords = {
          x,
          y,
        };
        const crossAxis = getSideAxis(placement);
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        const rawOffset = evaluate(offset, state);
        const computedOffset =
          typeof rawOffset === "number"
            ? {
                mainAxis: rawOffset,
                crossAxis: 0,
              }
            : {
                mainAxis: 0,
                crossAxis: 0,
                ...rawOffset,
              };
        if (checkMainAxis) {
          const len = mainAxis === "y" ? "height" : "width";
          const limitMin =
            rects.reference[mainAxis] -
            rects.floating[len] +
            computedOffset.mainAxis;
          const limitMax =
            rects.reference[mainAxis] +
            rects.reference[len] -
            computedOffset.mainAxis;
          if (mainAxisCoord < limitMin) {
            mainAxisCoord = limitMin;
          } else if (mainAxisCoord > limitMax) {
            mainAxisCoord = limitMax;
          }
        }
        if (checkCrossAxis) {
          var _middlewareData$offse, _middlewareData$offse2;
          const len = mainAxis === "y" ? "width" : "height";
          const isOriginSide = ["top", "left"].includes(getSide(placement));
          const limitMin =
            rects.reference[crossAxis] -
            rects.floating[len] +
            (isOriginSide
              ? ((_middlewareData$offse = middlewareData.offset) == null
                  ? void 0
                  : _middlewareData$offse[crossAxis]) || 0
              : 0) +
            (isOriginSide ? 0 : computedOffset.crossAxis);
          const limitMax =
            rects.reference[crossAxis] +
            rects.reference[len] +
            (isOriginSide
              ? 0
              : ((_middlewareData$offse2 = middlewareData.offset) == null
                  ? void 0
                  : _middlewareData$offse2[crossAxis]) || 0) -
            (isOriginSide ? computedOffset.crossAxis : 0);
          if (crossAxisCoord < limitMin) {
            crossAxisCoord = limitMin;
          } else if (crossAxisCoord > limitMax) {
            crossAxisCoord = limitMax;
          }
        }
        return {
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord,
        };
      },
    };
  };

  /**
   * Provides data that allows you to change the size of the floating element —
   * for instance, prevent it from overflowing the clipping boundary or match the
   * width of the reference element.
   * @see https://floating-ui.com/docs/size
   */
  const size = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "size",
      options,
      async fn(state) {
        var _state$middlewareData, _state$middlewareData2;
        const { placement, rects, platform, elements } = state;
        const { apply = () => {}, ...detectOverflowOptions } = evaluate(
          options,
          state
        );
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const side = getSide(placement);
        const alignment = getAlignment(placement);
        const isYAxis = getSideAxis(placement) === "y";
        const { width, height } = rects.floating;
        let heightSide;
        let widthSide;
        if (side === "top" || side === "bottom") {
          heightSide = side;
          widthSide =
            alignment ===
            ((await (platform.isRTL == null
              ? void 0
              : platform.isRTL(elements.floating)))
              ? "start"
              : "end")
              ? "left"
              : "right";
        } else {
          widthSide = side;
          heightSide = alignment === "end" ? "top" : "bottom";
        }
        const maximumClippingHeight = height - overflow.top - overflow.bottom;
        const maximumClippingWidth = width - overflow.left - overflow.right;
        const overflowAvailableHeight = min(
          height - overflow[heightSide],
          maximumClippingHeight
        );
        const overflowAvailableWidth = min(
          width - overflow[widthSide],
          maximumClippingWidth
        );
        const noShift = !state.middlewareData.shift;
        let availableHeight = overflowAvailableHeight;
        let availableWidth = overflowAvailableWidth;
        if (
          (_state$middlewareData = state.middlewareData.shift) != null &&
          _state$middlewareData.enabled.x
        ) {
          availableWidth = maximumClippingWidth;
        }
        if (
          (_state$middlewareData2 = state.middlewareData.shift) != null &&
          _state$middlewareData2.enabled.y
        ) {
          availableHeight = maximumClippingHeight;
        }
        if (noShift && !alignment) {
          const xMin = max(overflow.left, 0);
          const xMax = max(overflow.right, 0);
          const yMin = max(overflow.top, 0);
          const yMax = max(overflow.bottom, 0);
          if (isYAxis) {
            availableWidth =
              width -
              2 *
                (xMin !== 0 || xMax !== 0
                  ? xMin + xMax
                  : max(overflow.left, overflow.right));
          } else {
            availableHeight =
              height -
              2 *
                (yMin !== 0 || yMax !== 0
                  ? yMin + yMax
                  : max(overflow.top, overflow.bottom));
          }
        }
        await apply({
          ...state,
          availableWidth,
          availableHeight,
        });
        const nextDimensions = await platform.getDimensions(elements.floating);
        if (
          width !== nextDimensions.width ||
          height !== nextDimensions.height
        ) {
          return {
            reset: {
              rects: true,
            },
          };
        }
        return {};
      },
    };
  };

  exports.arrow = arrow;
  exports.autoPlacement = autoPlacement;
  exports.computePosition = computePosition;
  exports.detectOverflow = detectOverflow;
  exports.flip = flip;
  exports.hide = hide;
  exports.inline = inline;
  exports.limitShift = limitShift;
  exports.offset = offset;
  exports.rectToClientRect = rectToClientRect;
  exports.shift = shift;
  exports.size = size;
});

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports, require("@floating-ui/core"))
    : typeof define === "function" && define.amd
    ? define(["exports", "@floating-ui/core"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.FloatingUIDOM = {}), global.FloatingUICore));
})(this, function (exports, core) {
  "use strict";

  /**
   * Custom positioning reference element.
   * @see https://floating-ui.com/docs/virtual-elements
   */

  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  const floor = Math.floor;
  const createCoords = (v) => ({
    x: v,
    y: v,
  });

  function hasWindow() {
    return typeof window !== "undefined";
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || "").toLowerCase();
    }
    // Mocked nodes in testing environments may not be instances of Node. By
    // returning `#document` an infinite loop won't occur.
    // https://github.com/floating-ui/floating-ui/issues/2317
    return "#document";
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (
      (node == null || (_node$ownerDocument = node.ownerDocument) == null
        ? void 0
        : _node$ownerDocument.defaultView) || window
    );
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref =
      (isNode(node) ? node.ownerDocument : node.document) || window.document) ==
      null
      ? void 0
      : _ref.documentElement;
  }
  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return (
      value instanceof Element || value instanceof getWindow(value).Element
    );
  }
  function isHTMLElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return (
      value instanceof HTMLElement ||
      value instanceof getWindow(value).HTMLElement
    );
  }
  function isShadowRoot(value) {
    if (!hasWindow() || typeof ShadowRoot === "undefined") {
      return false;
    }
    return (
      value instanceof ShadowRoot ||
      value instanceof getWindow(value).ShadowRoot
    );
  }
  function isOverflowElement(element) {
    const { overflow, overflowX, overflowY, display } =
      getComputedStyle(element);
    return (
      /auto|scroll|overlay|hidden|clip/.test(
        overflow + overflowY + overflowX
      ) && !["inline", "contents"].includes(display)
    );
  }
  function isTableElement(element) {
    return ["table", "td", "th"].includes(getNodeName(element));
  }
  function isTopLayer(element) {
    return [":popover-open", ":modal"].some((selector) => {
      try {
        return element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss)
      ? getComputedStyle(elementOrCss)
      : elementOrCss;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    // https://drafts.csswg.org/css-transforms-2/#individual-transforms
    return (
      ["transform", "translate", "scale", "rotate", "perspective"].some(
        (value) => (css[value] ? css[value] !== "none" : false)
      ) ||
      (css.containerType ? css.containerType !== "normal" : false) ||
      (!webkit &&
        (css.backdropFilter ? css.backdropFilter !== "none" : false)) ||
      (!webkit && (css.filter ? css.filter !== "none" : false)) ||
      [
        "transform",
        "translate",
        "scale",
        "rotate",
        "perspective",
        "filter",
      ].some((value) => (css.willChange || "").includes(value)) ||
      ["paint", "layout", "strict", "content"].some((value) =>
        (css.contain || "").includes(value)
      )
    );
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("-webkit-backdrop-filter", "none");
  }
  function isLastTraversableNode(node) {
    return ["html", "body", "#document"].includes(getNodeName(node));
  }
  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      };
    }
    return {
      scrollLeft: element.scrollX,
      scrollTop: element.scrollY,
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === "html") {
      return node;
    }
    const result =
      // Step into the shadow DOM of the parent of a slotted node.
      node.assignedSlot ||
      // DOM Element detected.
      node.parentNode ||
      // ShadowRoot detected.
      (isShadowRoot(node) && node.host) ||
      // Fallback.
      getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody =
      scrollableAncestor ===
      ((_node$ownerDocument2 = node.ownerDocument) == null
        ? void 0
        : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(
        win,
        win.visualViewport || [],
        isOverflowElement(scrollableAncestor) ? scrollableAncestor : [],
        frameElement && traverseIframes
          ? getOverflowAncestors(frameElement)
          : []
      );
    }
    return list.concat(
      scrollableAncestor,
      getOverflowAncestors(scrollableAncestor, [], traverseIframes)
    );
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent)
      ? win.frameElement
      : null;
  }

  function getCssDimensions(element) {
    const css = getComputedStyle(element);
    // In testing environments, the `width` and `height` properties are empty
    // strings for SVG elements, returning NaN. Fallback to `0` in this case.
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback =
      round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback,
    };
  }

  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }

  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const { width, height, $ } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;

    // 0, NaN, or Infinity should always fallback to 1.

    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y,
    };
  }

  const noOffsets = /*#__PURE__*/ createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop,
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (
      !floatingOffsetParent ||
      (isFixed && floatingOffsetParent !== getWindow(element))
    ) {
      return false;
    }
    return isFixed;
  }

  function getBoundingClientRect(
    element,
    includeScale,
    isFixedStrategy,
    offsetParent
  ) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(
      domElement,
      isFixedStrategy,
      offsetParent
    )
      ? getVisualOffsets(domElement)
      : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin =
        offsetParent && isElement(offsetParent)
          ? getWindow(offsetParent)
          : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        const left =
          iframeRect.left +
          (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) *
            iframeScale.x;
        const top =
          iframeRect.top +
          (currentIFrame.clientTop + parseFloat(css.paddingTop)) *
            iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return core.rectToClientRect({
      width,
      height,
      x,
      y,
    });
  }

  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    if (!rect) {
      return (
        getBoundingClientRect(getDocumentElement(element)).left + leftScroll
      );
    }
    return rect.left + leftScroll;
  }

  function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
    if (ignoreScrollbarX === void 0) {
      ignoreScrollbarX = false;
    }
    const htmlRect = documentElement.getBoundingClientRect();
    const x =
      htmlRect.left +
      scroll.scrollLeft -
      (ignoreScrollbarX
        ? 0
        : // RTL <body> scrollbar.
          getWindowScrollBarX(documentElement, htmlRect));
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y,
    };
  }

  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let { elements, rect, offsetParent, strategy } = _ref;
    const isFixed = strategy === "fixed";
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || (topLayer && isFixed)) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0,
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
      if (
        getNodeName(offsetParent) !== "body" ||
        isOverflowElement(documentElement)
      ) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    const htmlOffset =
      documentElement && !isOffsetParentAnElement && !isFixed
        ? getHTMLOffset(documentElement, scroll, true)
        : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x:
        rect.x * scale.x -
        scroll.scrollLeft * scale.x +
        offsets.x +
        htmlOffset.x,
      y:
        rect.y * scale.y -
        scroll.scrollTop * scale.y +
        offsets.y +
        htmlOffset.y,
    };
  }

  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }

  // Gets the entire size of the scrollable document area, even extending outside
  // of the `<html>` and `<body>` rect bounds if horizontally scrollable.
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(
      html.scrollWidth,
      html.clientWidth,
      body.scrollWidth,
      body.clientWidth
    );
    const height = max(
      html.scrollHeight,
      html.clientHeight,
      body.scrollHeight,
      body.clientHeight
    );
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle(body).direction === "rtl") {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y,
    };
  }

  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (
        !visualViewportBased ||
        (visualViewportBased && strategy === "fixed")
      ) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y,
    };
  }

  // Returns the inner client rect, subtracting scrollbars if present.
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(
      element,
      true,
      strategy === "fixed"
    );
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y,
    };
  }
  function getClientRectFromClippingAncestor(
    element,
    clippingAncestor,
    strategy
  ) {
    let rect;
    if (clippingAncestor === "viewport") {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === "document") {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height,
      };
    }
    return core.rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (
      parentNode === stopNode ||
      !isElement(parentNode) ||
      isLastTraversableNode(parentNode)
    ) {
      return false;
    }
    return (
      getComputedStyle(parentNode).position === "fixed" ||
      hasFixedPositionAncestor(parentNode, stopNode)
    );
  }

  // A "clipping ancestor" is an `overflow` element with the characteristic of
  // clipping (or hiding) child elements. This returns all clipping ancestors
  // of the given element up the tree.
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element, [], false).filter(
      (el) => isElement(el) && getNodeName(el) !== "body"
    );
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle(element).position === "fixed";
    let currentNode = elementIsFixed ? getParentNode(element) : element;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === "fixed") {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed
        ? !currentNodeIsContaining && !currentContainingBlockComputedStyle
        : (!currentNodeIsContaining &&
            computedStyle.position === "static" &&
            !!currentContainingBlockComputedStyle &&
            ["absolute", "fixed"].includes(
              currentContainingBlockComputedStyle.position
            )) ||
          (isOverflowElement(currentNode) &&
            !currentNodeIsContaining &&
            hasFixedPositionAncestor(element, currentNode));
      if (shouldDropCurrentNode) {
        // Drop non-containing blocks.
        result = result.filter((ancestor) => ancestor !== currentNode);
      } else {
        // Record last containing block for next iteration.
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }

  // Gets the maximum area that the element is visible in due to any number of
  // clipping ancestors.
  function getClippingRect(_ref) {
    let { element, boundary, rootBoundary, strategy } = _ref;
    const elementClippingAncestors =
      boundary === "clippingAncestors"
        ? isTopLayer(element)
          ? []
          : getClippingElementAncestors(element, this._c)
        : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce(
      (accRect, clippingAncestor) => {
        const rect = getClientRectFromClippingAncestor(
          element,
          clippingAncestor,
          strategy
        );
        accRect.top = max(rect.top, accRect.top);
        accRect.right = min(rect.right, accRect.right);
        accRect.bottom = min(rect.bottom, accRect.bottom);
        accRect.left = max(rect.left, accRect.left);
        return accRect;
      },
      getClientRectFromClippingAncestor(
        element,
        firstClippingAncestor,
        strategy
      )
    );
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top,
    };
  }

  function getDimensions(element) {
    const { width, height } = getCssDimensions(element);
    return {
      width,
      height,
    };
  }

  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === "fixed";
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0,
    };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
      if (
        getNodeName(offsetParent) !== "body" ||
        isOverflowElement(documentElement)
      ) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(
          offsetParent,
          true,
          isFixed,
          offsetParent
        );
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
        // Firefox with layout.scrollbar.side = 3 in about:config to test this.
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    const htmlOffset =
      documentElement && !isOffsetParentAnElement && !isFixed
        ? getHTMLOffset(documentElement, scroll)
        : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height,
    };
  }

  function isStaticPositioned(element) {
    return getComputedStyle(element).position === "static";
  }

  function getTrueOffsetParent(element, polyfill) {
    if (
      !isHTMLElement(element) ||
      getComputedStyle(element).position === "fixed"
    ) {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;

    // Firefox returns the <html> element as the offsetParent if it's non-static,
    // while Chrome and Safari return the <body> element. The <body> element must
    // be used to perform the correct calculations even if the <html> element is
    // non-static.
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }

  // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.
  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (
          isElement(svgOffsetParent) &&
          !isStaticPositioned(svgOffsetParent)
        ) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (
      offsetParent &&
      isTableElement(offsetParent) &&
      isStaticPositioned(offsetParent)
    ) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (
      offsetParent &&
      isLastTraversableNode(offsetParent) &&
      isStaticPositioned(offsetParent) &&
      !isContainingBlock(offsetParent)
    ) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }

  const getElementRects = async function (data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(
        data.reference,
        await getOffsetParentFn(data.floating),
        data.strategy
      ),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height,
      },
    };
  };

  function isRTL(element) {
    return getComputedStyle(element).direction === "rtl";
  }

  const platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL,
  };

  function rectsAreEqual(a, b) {
    return (
      a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
    );
  }

  // https://samthor.au/2021/observing-dom/
  function observeMove(element, onMove) {
    let io = null;
    let timeoutId;
    const root = getDocumentElement(element);
    function cleanup() {
      var _io;
      clearTimeout(timeoutId);
      (_io = io) == null || _io.disconnect();
      io = null;
    }
    function refresh(skip, threshold) {
      if (skip === void 0) {
        skip = false;
      }
      if (threshold === void 0) {
        threshold = 1;
      }
      cleanup();
      const elementRectForRootMargin = element.getBoundingClientRect();
      const { left, top, width, height } = elementRectForRootMargin;
      if (!skip) {
        onMove();
      }
      if (!width || !height) {
        return;
      }
      const insetTop = floor(top);
      const insetRight = floor(root.clientWidth - (left + width));
      const insetBottom = floor(root.clientHeight - (top + height));
      const insetLeft = floor(left);
      const rootMargin =
        -insetTop +
        "px " +
        -insetRight +
        "px " +
        -insetBottom +
        "px " +
        -insetLeft +
        "px";
      const options = {
        rootMargin,
        threshold: max(0, min(1, threshold)) || 1,
      };
      let isFirstUpdate = true;
      function handleObserve(entries) {
        const ratio = entries[0].intersectionRatio;
        if (ratio !== threshold) {
          if (!isFirstUpdate) {
            return refresh();
          }
          if (!ratio) {
            // If the reference is clipped, the ratio is 0. Throttle the refresh
            // to prevent an infinite loop of updates.
            timeoutId = setTimeout(() => {
              refresh(false, 1e-7);
            }, 1000);
          } else {
            refresh(false, ratio);
          }
        }
        if (
          ratio === 1 &&
          !rectsAreEqual(
            elementRectForRootMargin,
            element.getBoundingClientRect()
          )
        ) {
          // It's possible that even though the ratio is reported as 1, the
          // element is not actually fully within the IntersectionObserver's root
          // area anymore. This can happen under performance constraints. This may
          // be a bug in the browser's IntersectionObserver implementation. To
          // work around this, we compare the element's bounding rect now with
          // what it was at the time we created the IntersectionObserver. If they
          // are not equal then the element moved, so we refresh.
          refresh();
        }
        isFirstUpdate = false;
      }

      // Older browsers don't support a `document` as the root and will throw an
      // error.
      try {
        io = new IntersectionObserver(handleObserve, {
          ...options,
          // Handle <iframe>s
          root: root.ownerDocument,
        });
      } catch (e) {
        io = new IntersectionObserver(handleObserve, options);
      }
      io.observe(element);
    }
    refresh(true);
    return cleanup;
  }

  /**
   * Automatically updates the position of the floating element when necessary.
   * Should only be called when the floating element is mounted on the DOM or
   * visible on the screen.
   * @returns cleanup function that should be invoked when the floating element is
   * removed from the DOM or hidden from the screen.
   * @see https://floating-ui.com/docs/autoUpdate
   */
  function autoUpdate(reference, floating, update, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      ancestorScroll = true,
      ancestorResize = true,
      elementResize = typeof ResizeObserver === "function",
      layoutShift = typeof IntersectionObserver === "function",
      animationFrame = false,
    } = options;
    const referenceEl = unwrapElement(reference);
    const ancestors =
      ancestorScroll || ancestorResize
        ? [
            ...(referenceEl ? getOverflowAncestors(referenceEl) : []),
            ...getOverflowAncestors(floating),
          ]
        : [];
    ancestors.forEach((ancestor) => {
      ancestorScroll &&
        ancestor.addEventListener("scroll", update, {
          passive: true,
        });
      ancestorResize && ancestor.addEventListener("resize", update);
    });
    const cleanupIo =
      referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
    let reobserveFrame = -1;
    let resizeObserver = null;
    if (elementResize) {
      resizeObserver = new ResizeObserver((_ref) => {
        let [firstEntry] = _ref;
        if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
          // Prevent update loops when using the `size` middleware.
          // https://github.com/floating-ui/floating-ui/issues/1740
          resizeObserver.unobserve(floating);
          cancelAnimationFrame(reobserveFrame);
          reobserveFrame = requestAnimationFrame(() => {
            var _resizeObserver;
            (_resizeObserver = resizeObserver) == null ||
              _resizeObserver.observe(floating);
          });
        }
        update();
      });
      if (referenceEl && !animationFrame) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
        update();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update();
    return () => {
      var _resizeObserver2;
      ancestors.forEach((ancestor) => {
        ancestorScroll && ancestor.removeEventListener("scroll", update);
        ancestorResize && ancestor.removeEventListener("resize", update);
      });
      cleanupIo == null || cleanupIo();
      (_resizeObserver2 = resizeObserver) == null ||
        _resizeObserver2.disconnect();
      resizeObserver = null;
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }

  /**
   * Resolves with an object of overflow side offsets that determine how much the
   * element is overflowing a given clipping boundary on each side.
   * - positive = overflowing the boundary by that number of pixels
   * - negative = how many pixels left before it will overflow
   * - 0 = lies flush with the boundary
   * @see https://floating-ui.com/docs/detectOverflow
   */
  const detectOverflow = core.detectOverflow;

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset = core.offset;

  /**
   * Optimizes the visibility of the floating element by choosing the placement
   * that has the most space available automatically, without needing to specify a
   * preferred placement. Alternative to `flip`.
   * @see https://floating-ui.com/docs/autoPlacement
   */
  const autoPlacement = core.autoPlacement;

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift = core.shift;

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip = core.flip;

  /**
   * Provides data that allows you to change the size of the floating element —
   * for instance, prevent it from overflowing the clipping boundary or match the
   * width of the reference element.
   * @see https://floating-ui.com/docs/size
   */
  const size = core.size;

  /**
   * Provides data to hide the floating element in applicable situations, such as
   * when it is not in the same clipping context as the reference element.
   * @see https://floating-ui.com/docs/hide
   */
  const hide = core.hide;

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow = core.arrow;

  /**
   * Provides improved positioning for inline reference elements that can span
   * over multiple lines, such as hyperlinks or range selections.
   * @see https://floating-ui.com/docs/inline
   */
  const inline = core.inline;

  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  const limitShift = core.limitShift;

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a given reference element.
   */
  const computePosition = (reference, floating, options) => {
    // This caches the expensive `getClippingElementAncestors` function so that
    // multiple lifecycle resets re-use the same result. It only lives for a
    // single call. If other functions become expensive, we can add them as well.
    const cache = new Map();
    const mergedOptions = {
      platform,
      ...options,
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache,
    };
    return core.computePosition(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache,
    });
  };

  exports.arrow = arrow;
  exports.autoPlacement = autoPlacement;
  exports.autoUpdate = autoUpdate;
  exports.computePosition = computePosition;
  exports.detectOverflow = detectOverflow;
  exports.flip = flip;
  exports.getOverflowAncestors = getOverflowAncestors;
  exports.hide = hide;
  exports.inline = inline;
  exports.limitShift = limitShift;
  exports.offset = offset;
  exports.platform = platform;
  exports.shift = shift;
  exports.size = size;
});

/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */
!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define(t)
    : ((e =
        "undefined" != typeof globalThis ? globalThis : e || self).DOMPurify =
        t());
})(this, function () {
  "use strict";
  const {
    entries: e,
    setPrototypeOf: t,
    isFrozen: n,
    getPrototypeOf: o,
    getOwnPropertyDescriptor: r,
  } = Object;
  let { freeze: i, seal: a, create: l } = Object,
    { apply: c, construct: s } = "undefined" != typeof Reflect && Reflect;
  i ||
    (i = function (e) {
      return e;
    }),
    a ||
      (a = function (e) {
        return e;
      }),
    c ||
      (c = function (e, t, n) {
        return e.apply(t, n);
      }),
    s ||
      (s = function (e, t) {
        return new e(...t);
      });
  const u = R(Array.prototype.forEach),
    m = R(Array.prototype.lastIndexOf),
    p = R(Array.prototype.pop),
    f = R(Array.prototype.push),
    d = R(Array.prototype.splice),
    h = R(String.prototype.toLowerCase),
    g = R(String.prototype.toString),
    T = R(String.prototype.match),
    y = R(String.prototype.replace),
    E = R(String.prototype.indexOf),
    A = R(String.prototype.trim),
    _ = R(Object.prototype.hasOwnProperty),
    S = R(RegExp.prototype.test),
    b =
      ((N = TypeError),
      function () {
        for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
          t[n] = arguments[n];
        return s(N, t);
      });
  var N;
  function R(e) {
    return function (t) {
      t instanceof RegExp && (t.lastIndex = 0);
      for (
        var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1;
        r < n;
        r++
      )
        o[r - 1] = arguments[r];
      return c(e, t, o);
    };
  }
  function w(e, o) {
    let r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : h;
    t && t(e, null);
    let i = o.length;
    for (; i--; ) {
      let t = o[i];
      if ("string" == typeof t) {
        const e = r(t);
        e !== t && (n(o) || (o[i] = e), (t = e));
      }
      e[t] = !0;
    }
    return e;
  }
  function O(e) {
    for (let t = 0; t < e.length; t++) {
      _(e, t) || (e[t] = null);
    }
    return e;
  }
  function D(t) {
    const n = l(null);
    for (const [o, r] of e(t)) {
      _(t, o) &&
        (Array.isArray(r)
          ? (n[o] = O(r))
          : r && "object" == typeof r && r.constructor === Object
          ? (n[o] = D(r))
          : (n[o] = r));
    }
    return n;
  }
  function v(e, t) {
    for (; null !== e; ) {
      const n = r(e, t);
      if (n) {
        if (n.get) return R(n.get);
        if ("function" == typeof n.value) return R(n.value);
      }
      e = o(e);
    }
    return function () {
      return null;
    };
  }
  const L = i([
      "a",
      "abbr",
      "acronym",
      "address",
      "area",
      "article",
      "aside",
      "audio",
      "b",
      "bdi",
      "bdo",
      "big",
      "blink",
      "blockquote",
      "body",
      "br",
      "button",
      "canvas",
      "caption",
      "center",
      "cite",
      "code",
      "col",
      "colgroup",
      "content",
      "data",
      "datalist",
      "dd",
      "decorator",
      "del",
      "details",
      "dfn",
      "dialog",
      "dir",
      "div",
      "dl",
      "dt",
      "element",
      "em",
      "fieldset",
      "figcaption",
      "figure",
      "font",
      "footer",
      "form",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "head",
      "header",
      "hgroup",
      "hr",
      "html",
      "i",
      "img",
      "input",
      "ins",
      "kbd",
      "label",
      "legend",
      "li",
      "main",
      "map",
      "mark",
      "marquee",
      "menu",
      "menuitem",
      "meter",
      "nav",
      "nobr",
      "ol",
      "optgroup",
      "option",
      "output",
      "p",
      "picture",
      "pre",
      "progress",
      "q",
      "rp",
      "rt",
      "ruby",
      "s",
      "samp",
      "section",
      "select",
      "shadow",
      "small",
      "source",
      "spacer",
      "span",
      "strike",
      "strong",
      "style",
      "sub",
      "summary",
      "sup",
      "table",
      "tbody",
      "td",
      "template",
      "textarea",
      "tfoot",
      "th",
      "thead",
      "time",
      "tr",
      "track",
      "tt",
      "u",
      "ul",
      "var",
      "video",
      "wbr",
    ]),
    C = i([
      "svg",
      "a",
      "altglyph",
      "altglyphdef",
      "altglyphitem",
      "animatecolor",
      "animatemotion",
      "animatetransform",
      "circle",
      "clippath",
      "defs",
      "desc",
      "ellipse",
      "filter",
      "font",
      "g",
      "glyph",
      "glyphref",
      "hkern",
      "image",
      "line",
      "lineargradient",
      "marker",
      "mask",
      "metadata",
      "mpath",
      "path",
      "pattern",
      "polygon",
      "polyline",
      "radialgradient",
      "rect",
      "stop",
      "style",
      "switch",
      "symbol",
      "text",
      "textpath",
      "title",
      "tref",
      "tspan",
      "view",
      "vkern",
    ]),
    x = i([
      "feBlend",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feDistantLight",
      "feDropShadow",
      "feFlood",
      "feFuncA",
      "feFuncB",
      "feFuncG",
      "feFuncR",
      "feGaussianBlur",
      "feImage",
      "feMerge",
      "feMergeNode",
      "feMorphology",
      "feOffset",
      "fePointLight",
      "feSpecularLighting",
      "feSpotLight",
      "feTile",
      "feTurbulence",
    ]),
    I = i([
      "animate",
      "color-profile",
      "cursor",
      "discard",
      "font-face",
      "font-face-format",
      "font-face-name",
      "font-face-src",
      "font-face-uri",
      "foreignobject",
      "hatch",
      "hatchpath",
      "mesh",
      "meshgradient",
      "meshpatch",
      "meshrow",
      "missing-glyph",
      "script",
      "set",
      "solidcolor",
      "unknown",
      "use",
    ]),
    M = i([
      "math",
      "menclose",
      "merror",
      "mfenced",
      "mfrac",
      "mglyph",
      "mi",
      "mlabeledtr",
      "mmultiscripts",
      "mn",
      "mo",
      "mover",
      "mpadded",
      "mphantom",
      "mroot",
      "mrow",
      "ms",
      "mspace",
      "msqrt",
      "mstyle",
      "msub",
      "msup",
      "msubsup",
      "mtable",
      "mtd",
      "mtext",
      "mtr",
      "munder",
      "munderover",
      "mprescripts",
    ]),
    k = i([
      "maction",
      "maligngroup",
      "malignmark",
      "mlongdiv",
      "mscarries",
      "mscarry",
      "msgroup",
      "mstack",
      "msline",
      "msrow",
      "semantics",
      "annotation",
      "annotation-xml",
      "mprescripts",
      "none",
    ]),
    U = i(["#text"]),
    z = i([
      "accept",
      "action",
      "align",
      "alt",
      "autocapitalize",
      "autocomplete",
      "autopictureinpicture",
      "autoplay",
      "background",
      "bgcolor",
      "border",
      "capture",
      "cellpadding",
      "cellspacing",
      "checked",
      "cite",
      "class",
      "clear",
      "color",
      "cols",
      "colspan",
      "controls",
      "controlslist",
      "coords",
      "crossorigin",
      "datetime",
      "decoding",
      "default",
      "dir",
      "disabled",
      "disablepictureinpicture",
      "disableremoteplayback",
      "download",
      "draggable",
      "enctype",
      "enterkeyhint",
      "face",
      "for",
      "headers",
      "height",
      "hidden",
      "high",
      "href",
      "hreflang",
      "id",
      "inputmode",
      "integrity",
      "ismap",
      "kind",
      "label",
      "lang",
      "list",
      "loading",
      "loop",
      "low",
      "max",
      "maxlength",
      "media",
      "method",
      "min",
      "minlength",
      "multiple",
      "muted",
      "name",
      "nonce",
      "noshade",
      "novalidate",
      "nowrap",
      "open",
      "optimum",
      "pattern",
      "placeholder",
      "playsinline",
      "popover",
      "popovertarget",
      "popovertargetaction",
      "poster",
      "preload",
      "pubdate",
      "radiogroup",
      "readonly",
      "rel",
      "required",
      "rev",
      "reversed",
      "role",
      "rows",
      "rowspan",
      "spellcheck",
      "scope",
      "selected",
      "shape",
      "size",
      "sizes",
      "span",
      "srclang",
      "start",
      "src",
      "srcset",
      "step",
      "style",
      "summary",
      "tabindex",
      "title",
      "translate",
      "type",
      "usemap",
      "valign",
      "value",
      "width",
      "wrap",
      "xmlns",
      "slot",
    ]),
    P = i([
      "accent-height",
      "accumulate",
      "additive",
      "alignment-baseline",
      "amplitude",
      "ascent",
      "attributename",
      "attributetype",
      "azimuth",
      "basefrequency",
      "baseline-shift",
      "begin",
      "bias",
      "by",
      "class",
      "clip",
      "clippathunits",
      "clip-path",
      "clip-rule",
      "color",
      "color-interpolation",
      "color-interpolation-filters",
      "color-profile",
      "color-rendering",
      "cx",
      "cy",
      "d",
      "dx",
      "dy",
      "diffuseconstant",
      "direction",
      "display",
      "divisor",
      "dur",
      "edgemode",
      "elevation",
      "end",
      "exponent",
      "fill",
      "fill-opacity",
      "fill-rule",
      "filter",
      "filterunits",
      "flood-color",
      "flood-opacity",
      "font-family",
      "font-size",
      "font-size-adjust",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "fx",
      "fy",
      "g1",
      "g2",
      "glyph-name",
      "glyphref",
      "gradientunits",
      "gradienttransform",
      "height",
      "href",
      "id",
      "image-rendering",
      "in",
      "in2",
      "intercept",
      "k",
      "k1",
      "k2",
      "k3",
      "k4",
      "kerning",
      "keypoints",
      "keysplines",
      "keytimes",
      "lang",
      "lengthadjust",
      "letter-spacing",
      "kernelmatrix",
      "kernelunitlength",
      "lighting-color",
      "local",
      "marker-end",
      "marker-mid",
      "marker-start",
      "markerheight",
      "markerunits",
      "markerwidth",
      "maskcontentunits",
      "maskunits",
      "max",
      "mask",
      "media",
      "method",
      "mode",
      "min",
      "name",
      "numoctaves",
      "offset",
      "operator",
      "opacity",
      "order",
      "orient",
      "orientation",
      "origin",
      "overflow",
      "paint-order",
      "path",
      "pathlength",
      "patterncontentunits",
      "patterntransform",
      "patternunits",
      "points",
      "preservealpha",
      "preserveaspectratio",
      "primitiveunits",
      "r",
      "rx",
      "ry",
      "radius",
      "refx",
      "refy",
      "repeatcount",
      "repeatdur",
      "restart",
      "result",
      "rotate",
      "scale",
      "seed",
      "shape-rendering",
      "slope",
      "specularconstant",
      "specularexponent",
      "spreadmethod",
      "startoffset",
      "stddeviation",
      "stitchtiles",
      "stop-color",
      "stop-opacity",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-opacity",
      "stroke",
      "stroke-width",
      "style",
      "surfacescale",
      "systemlanguage",
      "tabindex",
      "tablevalues",
      "targetx",
      "targety",
      "transform",
      "transform-origin",
      "text-anchor",
      "text-decoration",
      "text-rendering",
      "textlength",
      "type",
      "u1",
      "u2",
      "unicode",
      "values",
      "viewbox",
      "visibility",
      "version",
      "vert-adv-y",
      "vert-origin-x",
      "vert-origin-y",
      "width",
      "word-spacing",
      "wrap",
      "writing-mode",
      "xchannelselector",
      "ychannelselector",
      "x",
      "x1",
      "x2",
      "xmlns",
      "y",
      "y1",
      "y2",
      "z",
      "zoomandpan",
    ]),
    H = i([
      "accent",
      "accentunder",
      "align",
      "bevelled",
      "close",
      "columnsalign",
      "columnlines",
      "columnspan",
      "denomalign",
      "depth",
      "dir",
      "display",
      "displaystyle",
      "encoding",
      "fence",
      "frame",
      "height",
      "href",
      "id",
      "largeop",
      "length",
      "linethickness",
      "lspace",
      "lquote",
      "mathbackground",
      "mathcolor",
      "mathsize",
      "mathvariant",
      "maxsize",
      "minsize",
      "movablelimits",
      "notation",
      "numalign",
      "open",
      "rowalign",
      "rowlines",
      "rowspacing",
      "rowspan",
      "rspace",
      "rquote",
      "scriptlevel",
      "scriptminsize",
      "scriptsizemultiplier",
      "selection",
      "separator",
      "separators",
      "stretchy",
      "subscriptshift",
      "supscriptshift",
      "symmetric",
      "voffset",
      "width",
      "xmlns",
    ]),
    F = i(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
    B = a(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
    W = a(/<%[\w\W]*|[\w\W]*%>/gm),
    G = a(/\$\{[\w\W]*/gm),
    Y = a(/^data-[\-\w.\u00B7-\uFFFF]+$/),
    j = a(/^aria-[\-\w]+$/),
    X = a(
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    ),
    q = a(/^(?:\w+script|data):/i),
    $ = a(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
    K = a(/^html$/i),
    V = a(/^[a-z][.\w]*(-[.\w]+)+$/i);
  var Z = Object.freeze({
    __proto__: null,
    ARIA_ATTR: j,
    ATTR_WHITESPACE: $,
    CUSTOM_ELEMENT: V,
    DATA_ATTR: Y,
    DOCTYPE_NAME: K,
    ERB_EXPR: W,
    IS_ALLOWED_URI: X,
    IS_SCRIPT_OR_DATA: q,
    MUSTACHE_EXPR: B,
    TMPLIT_EXPR: G,
  });
  const J = 1,
    Q = 3,
    ee = 7,
    te = 8,
    ne = 9,
    oe = function () {
      return "undefined" == typeof window ? null : window;
    };
  var re = (function t() {
    let n =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : oe();
    const o = (e) => t(e);
    if (
      ((o.version = "3.2.6"),
      (o.removed = []),
      !n || !n.document || n.document.nodeType !== ne || !n.Element)
    )
      return (o.isSupported = !1), o;
    let { document: r } = n;
    const a = r,
      c = a.currentScript,
      {
        DocumentFragment: s,
        HTMLTemplateElement: N,
        Node: R,
        Element: O,
        NodeFilter: B,
        NamedNodeMap: W = n.NamedNodeMap || n.MozNamedAttrMap,
        HTMLFormElement: G,
        DOMParser: Y,
        trustedTypes: j,
      } = n,
      q = O.prototype,
      $ = v(q, "cloneNode"),
      V = v(q, "remove"),
      re = v(q, "nextSibling"),
      ie = v(q, "childNodes"),
      ae = v(q, "parentNode");
    if ("function" == typeof N) {
      const e = r.createElement("template");
      e.content && e.content.ownerDocument && (r = e.content.ownerDocument);
    }
    let le,
      ce = "";
    const {
        implementation: se,
        createNodeIterator: ue,
        createDocumentFragment: me,
        getElementsByTagName: pe,
      } = r,
      { importNode: fe } = a;
    let de = {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: [],
    };
    o.isSupported =
      "function" == typeof e &&
      "function" == typeof ae &&
      se &&
      void 0 !== se.createHTMLDocument;
    const {
      MUSTACHE_EXPR: he,
      ERB_EXPR: ge,
      TMPLIT_EXPR: Te,
      DATA_ATTR: ye,
      ARIA_ATTR: Ee,
      IS_SCRIPT_OR_DATA: Ae,
      ATTR_WHITESPACE: _e,
      CUSTOM_ELEMENT: Se,
    } = Z;
    let { IS_ALLOWED_URI: be } = Z,
      Ne = null;
    const Re = w({}, [...L, ...C, ...x, ...M, ...U]);
    let we = null;
    const Oe = w({}, [...z, ...P, ...H, ...F]);
    let De = Object.seal(
        l(null, {
          tagNameCheck: {
            writable: !0,
            configurable: !1,
            enumerable: !0,
            value: null,
          },
          attributeNameCheck: {
            writable: !0,
            configurable: !1,
            enumerable: !0,
            value: null,
          },
          allowCustomizedBuiltInElements: {
            writable: !0,
            configurable: !1,
            enumerable: !0,
            value: !1,
          },
        })
      ),
      ve = null,
      Le = null,
      Ce = !0,
      xe = !0,
      Ie = !1,
      Me = !0,
      ke = !1,
      Ue = !0,
      ze = !1,
      Pe = !1,
      He = !1,
      Fe = !1,
      Be = !1,
      We = !1,
      Ge = !0,
      Ye = !1,
      je = !0,
      Xe = !1,
      qe = {},
      $e = null;
    const Ke = w({}, [
      "annotation-xml",
      "audio",
      "colgroup",
      "desc",
      "foreignobject",
      "head",
      "iframe",
      "math",
      "mi",
      "mn",
      "mo",
      "ms",
      "mtext",
      "noembed",
      "noframes",
      "noscript",
      "plaintext",
      "script",
      "style",
      "svg",
      "template",
      "thead",
      "title",
      "video",
      "xmp",
    ]);
    let Ve = null;
    const Ze = w({}, ["audio", "video", "img", "source", "image", "track"]);
    let Je = null;
    const Qe = w({}, [
        "alt",
        "class",
        "for",
        "id",
        "label",
        "name",
        "pattern",
        "placeholder",
        "role",
        "summary",
        "title",
        "value",
        "style",
        "xmlns",
      ]),
      et = "http://www.w3.org/1998/Math/MathML",
      tt = "http://www.w3.org/2000/svg",
      nt = "http://www.w3.org/1999/xhtml";
    let ot = nt,
      rt = !1,
      it = null;
    const at = w({}, [et, tt, nt], g);
    let lt = w({}, ["mi", "mo", "mn", "ms", "mtext"]),
      ct = w({}, ["annotation-xml"]);
    const st = w({}, ["title", "style", "font", "a", "script"]);
    let ut = null;
    const mt = ["application/xhtml+xml", "text/html"];
    let pt = null,
      ft = null;
    const dt = r.createElement("form"),
      ht = function (e) {
        return e instanceof RegExp || e instanceof Function;
      },
      gt = function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        if (!ft || ft !== e) {
          if (
            ((e && "object" == typeof e) || (e = {}),
            (e = D(e)),
            (ut =
              -1 === mt.indexOf(e.PARSER_MEDIA_TYPE)
                ? "text/html"
                : e.PARSER_MEDIA_TYPE),
            (pt = "application/xhtml+xml" === ut ? g : h),
            (Ne = _(e, "ALLOWED_TAGS") ? w({}, e.ALLOWED_TAGS, pt) : Re),
            (we = _(e, "ALLOWED_ATTR") ? w({}, e.ALLOWED_ATTR, pt) : Oe),
            (it = _(e, "ALLOWED_NAMESPACES")
              ? w({}, e.ALLOWED_NAMESPACES, g)
              : at),
            (Je = _(e, "ADD_URI_SAFE_ATTR")
              ? w(D(Qe), e.ADD_URI_SAFE_ATTR, pt)
              : Qe),
            (Ve = _(e, "ADD_DATA_URI_TAGS")
              ? w(D(Ze), e.ADD_DATA_URI_TAGS, pt)
              : Ze),
            ($e = _(e, "FORBID_CONTENTS") ? w({}, e.FORBID_CONTENTS, pt) : Ke),
            (ve = _(e, "FORBID_TAGS") ? w({}, e.FORBID_TAGS, pt) : D({})),
            (Le = _(e, "FORBID_ATTR") ? w({}, e.FORBID_ATTR, pt) : D({})),
            (qe = !!_(e, "USE_PROFILES") && e.USE_PROFILES),
            (Ce = !1 !== e.ALLOW_ARIA_ATTR),
            (xe = !1 !== e.ALLOW_DATA_ATTR),
            (Ie = e.ALLOW_UNKNOWN_PROTOCOLS || !1),
            (Me = !1 !== e.ALLOW_SELF_CLOSE_IN_ATTR),
            (ke = e.SAFE_FOR_TEMPLATES || !1),
            (Ue = !1 !== e.SAFE_FOR_XML),
            (ze = e.WHOLE_DOCUMENT || !1),
            (Fe = e.RETURN_DOM || !1),
            (Be = e.RETURN_DOM_FRAGMENT || !1),
            (We = e.RETURN_TRUSTED_TYPE || !1),
            (He = e.FORCE_BODY || !1),
            (Ge = !1 !== e.SANITIZE_DOM),
            (Ye = e.SANITIZE_NAMED_PROPS || !1),
            (je = !1 !== e.KEEP_CONTENT),
            (Xe = e.IN_PLACE || !1),
            (be = e.ALLOWED_URI_REGEXP || X),
            (ot = e.NAMESPACE || nt),
            (lt = e.MATHML_TEXT_INTEGRATION_POINTS || lt),
            (ct = e.HTML_INTEGRATION_POINTS || ct),
            (De = e.CUSTOM_ELEMENT_HANDLING || {}),
            e.CUSTOM_ELEMENT_HANDLING &&
              ht(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck) &&
              (De.tagNameCheck = e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),
            e.CUSTOM_ELEMENT_HANDLING &&
              ht(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) &&
              (De.attributeNameCheck =
                e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),
            e.CUSTOM_ELEMENT_HANDLING &&
              "boolean" ==
                typeof e.CUSTOM_ELEMENT_HANDLING
                  .allowCustomizedBuiltInElements &&
              (De.allowCustomizedBuiltInElements =
                e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),
            ke && (xe = !1),
            Be && (Fe = !0),
            qe &&
              ((Ne = w({}, U)),
              (we = []),
              !0 === qe.html && (w(Ne, L), w(we, z)),
              !0 === qe.svg && (w(Ne, C), w(we, P), w(we, F)),
              !0 === qe.svgFilters && (w(Ne, x), w(we, P), w(we, F)),
              !0 === qe.mathMl && (w(Ne, M), w(we, H), w(we, F))),
            e.ADD_TAGS && (Ne === Re && (Ne = D(Ne)), w(Ne, e.ADD_TAGS, pt)),
            e.ADD_ATTR && (we === Oe && (we = D(we)), w(we, e.ADD_ATTR, pt)),
            e.ADD_URI_SAFE_ATTR && w(Je, e.ADD_URI_SAFE_ATTR, pt),
            e.FORBID_CONTENTS &&
              ($e === Ke && ($e = D($e)), w($e, e.FORBID_CONTENTS, pt)),
            je && (Ne["#text"] = !0),
            ze && w(Ne, ["html", "head", "body"]),
            Ne.table && (w(Ne, ["tbody"]), delete ve.tbody),
            e.TRUSTED_TYPES_POLICY)
          ) {
            if ("function" != typeof e.TRUSTED_TYPES_POLICY.createHTML)
              throw b(
                'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.'
              );
            if ("function" != typeof e.TRUSTED_TYPES_POLICY.createScriptURL)
              throw b(
                'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.'
              );
            (le = e.TRUSTED_TYPES_POLICY), (ce = le.createHTML(""));
          } else
            void 0 === le &&
              (le = (function (e, t) {
                if ("object" != typeof e || "function" != typeof e.createPolicy)
                  return null;
                let n = null;
                const o = "data-tt-policy-suffix";
                t && t.hasAttribute(o) && (n = t.getAttribute(o));
                const r = "dompurify" + (n ? "#" + n : "");
                try {
                  return e.createPolicy(r, {
                    createHTML: (e) => e,
                    createScriptURL: (e) => e,
                  });
                } catch (e) {
                  return (
                    console.warn(
                      "TrustedTypes policy " + r + " could not be created."
                    ),
                    null
                  );
                }
              })(j, c)),
              null !== le && "string" == typeof ce && (ce = le.createHTML(""));
          i && i(e), (ft = e);
        }
      },
      Tt = w({}, [...C, ...x, ...I]),
      yt = w({}, [...M, ...k]),
      Et = function (e) {
        f(o.removed, { element: e });
        try {
          ae(e).removeChild(e);
        } catch (t) {
          V(e);
        }
      },
      At = function (e, t) {
        try {
          f(o.removed, { attribute: t.getAttributeNode(e), from: t });
        } catch (e) {
          f(o.removed, { attribute: null, from: t });
        }
        if ((t.removeAttribute(e), "is" === e))
          if (Fe || Be)
            try {
              Et(t);
            } catch (e) {}
          else
            try {
              t.setAttribute(e, "");
            } catch (e) {}
      },
      _t = function (e) {
        let t = null,
          n = null;
        if (He) e = "<remove></remove>" + e;
        else {
          const t = T(e, /^[\r\n\t ]+/);
          n = t && t[0];
        }
        "application/xhtml+xml" === ut &&
          ot === nt &&
          (e =
            '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' +
            e +
            "</body></html>");
        const o = le ? le.createHTML(e) : e;
        if (ot === nt)
          try {
            t = new Y().parseFromString(o, ut);
          } catch (e) {}
        if (!t || !t.documentElement) {
          t = se.createDocument(ot, "template", null);
          try {
            t.documentElement.innerHTML = rt ? ce : o;
          } catch (e) {}
        }
        const i = t.body || t.documentElement;
        return (
          e &&
            n &&
            i.insertBefore(r.createTextNode(n), i.childNodes[0] || null),
          ot === nt
            ? pe.call(t, ze ? "html" : "body")[0]
            : ze
            ? t.documentElement
            : i
        );
      },
      St = function (e) {
        return ue.call(
          e.ownerDocument || e,
          e,
          B.SHOW_ELEMENT |
            B.SHOW_COMMENT |
            B.SHOW_TEXT |
            B.SHOW_PROCESSING_INSTRUCTION |
            B.SHOW_CDATA_SECTION,
          null
        );
      },
      bt = function (e) {
        return (
          e instanceof G &&
          ("string" != typeof e.nodeName ||
            "string" != typeof e.textContent ||
            "function" != typeof e.removeChild ||
            !(e.attributes instanceof W) ||
            "function" != typeof e.removeAttribute ||
            "function" != typeof e.setAttribute ||
            "string" != typeof e.namespaceURI ||
            "function" != typeof e.insertBefore ||
            "function" != typeof e.hasChildNodes)
        );
      },
      Nt = function (e) {
        return "function" == typeof R && e instanceof R;
      };
    function Rt(e, t, n) {
      u(e, (e) => {
        e.call(o, t, n, ft);
      });
    }
    const wt = function (e) {
        let t = null;
        if ((Rt(de.beforeSanitizeElements, e, null), bt(e))) return Et(e), !0;
        const n = pt(e.nodeName);
        if (
          (Rt(de.uponSanitizeElement, e, { tagName: n, allowedTags: Ne }),
          Ue &&
            e.hasChildNodes() &&
            !Nt(e.firstElementChild) &&
            S(/<[/\w!]/g, e.innerHTML) &&
            S(/<[/\w!]/g, e.textContent))
        )
          return Et(e), !0;
        if (e.nodeType === ee) return Et(e), !0;
        if (Ue && e.nodeType === te && S(/<[/\w]/g, e.data)) return Et(e), !0;
        if (!Ne[n] || ve[n]) {
          if (!ve[n] && Dt(n)) {
            if (De.tagNameCheck instanceof RegExp && S(De.tagNameCheck, n))
              return !1;
            if (De.tagNameCheck instanceof Function && De.tagNameCheck(n))
              return !1;
          }
          if (je && !$e[n]) {
            const t = ae(e) || e.parentNode,
              n = ie(e) || e.childNodes;
            if (n && t) {
              for (let o = n.length - 1; o >= 0; --o) {
                const r = $(n[o], !0);
                (r.__removalCount = (e.__removalCount || 0) + 1),
                  t.insertBefore(r, re(e));
              }
            }
          }
          return Et(e), !0;
        }
        return e instanceof O &&
          !(function (e) {
            let t = ae(e);
            (t && t.tagName) || (t = { namespaceURI: ot, tagName: "template" });
            const n = h(e.tagName),
              o = h(t.tagName);
            return (
              !!it[e.namespaceURI] &&
              (e.namespaceURI === tt
                ? t.namespaceURI === nt
                  ? "svg" === n
                  : t.namespaceURI === et
                  ? "svg" === n && ("annotation-xml" === o || lt[o])
                  : Boolean(Tt[n])
                : e.namespaceURI === et
                ? t.namespaceURI === nt
                  ? "math" === n
                  : t.namespaceURI === tt
                  ? "math" === n && ct[o]
                  : Boolean(yt[n])
                : e.namespaceURI === nt
                ? !(t.namespaceURI === tt && !ct[o]) &&
                  !(t.namespaceURI === et && !lt[o]) &&
                  !yt[n] &&
                  (st[n] || !Tt[n])
                : !("application/xhtml+xml" !== ut || !it[e.namespaceURI]))
            );
          })(e)
          ? (Et(e), !0)
          : ("noscript" !== n && "noembed" !== n && "noframes" !== n) ||
            !S(/<\/no(script|embed|frames)/i, e.innerHTML)
          ? (ke &&
              e.nodeType === Q &&
              ((t = e.textContent),
              u([he, ge, Te], (e) => {
                t = y(t, e, " ");
              }),
              e.textContent !== t &&
                (f(o.removed, { element: e.cloneNode() }),
                (e.textContent = t))),
            Rt(de.afterSanitizeElements, e, null),
            !1)
          : (Et(e), !0);
      },
      Ot = function (e, t, n) {
        if (Ge && ("id" === t || "name" === t) && (n in r || n in dt))
          return !1;
        if (xe && !Le[t] && S(ye, t));
        else if (Ce && S(Ee, t));
        else if (!we[t] || Le[t]) {
          if (
            !(
              (Dt(e) &&
                ((De.tagNameCheck instanceof RegExp && S(De.tagNameCheck, e)) ||
                  (De.tagNameCheck instanceof Function &&
                    De.tagNameCheck(e))) &&
                ((De.attributeNameCheck instanceof RegExp &&
                  S(De.attributeNameCheck, t)) ||
                  (De.attributeNameCheck instanceof Function &&
                    De.attributeNameCheck(t)))) ||
              ("is" === t &&
                De.allowCustomizedBuiltInElements &&
                ((De.tagNameCheck instanceof RegExp && S(De.tagNameCheck, n)) ||
                  (De.tagNameCheck instanceof Function && De.tagNameCheck(n))))
            )
          )
            return !1;
        } else if (Je[t]);
        else if (S(be, y(n, _e, "")));
        else if (
          ("src" !== t && "xlink:href" !== t && "href" !== t) ||
          "script" === e ||
          0 !== E(n, "data:") ||
          !Ve[e]
        ) {
          if (Ie && !S(Ae, y(n, _e, "")));
          else if (n) return !1;
        } else;
        return !0;
      },
      Dt = function (e) {
        return "annotation-xml" !== e && T(e, Se);
      },
      vt = function (e) {
        Rt(de.beforeSanitizeAttributes, e, null);
        const { attributes: t } = e;
        if (!t || bt(e)) return;
        const n = {
          attrName: "",
          attrValue: "",
          keepAttr: !0,
          allowedAttributes: we,
          forceKeepAttr: void 0,
        };
        let r = t.length;
        for (; r--; ) {
          const i = t[r],
            { name: a, namespaceURI: l, value: c } = i,
            s = pt(a),
            m = c;
          let f = "value" === a ? m : A(m);
          if (
            ((n.attrName = s),
            (n.attrValue = f),
            (n.keepAttr = !0),
            (n.forceKeepAttr = void 0),
            Rt(de.uponSanitizeAttribute, e, n),
            (f = n.attrValue),
            !Ye ||
              ("id" !== s && "name" !== s) ||
              (At(a, e), (f = "user-content-" + f)),
            Ue && S(/((--!?|])>)|<\/(style|title)/i, f))
          ) {
            At(a, e);
            continue;
          }
          if (n.forceKeepAttr) continue;
          if (!n.keepAttr) {
            At(a, e);
            continue;
          }
          if (!Me && S(/\/>/i, f)) {
            At(a, e);
            continue;
          }
          ke &&
            u([he, ge, Te], (e) => {
              f = y(f, e, " ");
            });
          const d = pt(e.nodeName);
          if (Ot(d, s, f)) {
            if (
              le &&
              "object" == typeof j &&
              "function" == typeof j.getAttributeType
            )
              if (l);
              else
                switch (j.getAttributeType(d, s)) {
                  case "TrustedHTML":
                    f = le.createHTML(f);
                    break;
                  case "TrustedScriptURL":
                    f = le.createScriptURL(f);
                }
            if (f !== m)
              try {
                l ? e.setAttributeNS(l, a, f) : e.setAttribute(a, f),
                  bt(e) ? Et(e) : p(o.removed);
              } catch (t) {
                At(a, e);
              }
          } else At(a, e);
        }
        Rt(de.afterSanitizeAttributes, e, null);
      },
      Lt = function e(t) {
        let n = null;
        const o = St(t);
        for (Rt(de.beforeSanitizeShadowDOM, t, null); (n = o.nextNode()); )
          Rt(de.uponSanitizeShadowNode, n, null),
            wt(n),
            vt(n),
            n.content instanceof s && e(n.content);
        Rt(de.afterSanitizeShadowDOM, t, null);
      };
    return (
      (o.sanitize = function (e) {
        let t =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          n = null,
          r = null,
          i = null,
          l = null;
        if (
          ((rt = !e), rt && (e = "\x3c!--\x3e"), "string" != typeof e && !Nt(e))
        ) {
          if ("function" != typeof e.toString)
            throw b("toString is not a function");
          if ("string" != typeof (e = e.toString()))
            throw b("dirty is not a string, aborting");
        }
        if (!o.isSupported) return e;
        if (
          (Pe || gt(t), (o.removed = []), "string" == typeof e && (Xe = !1), Xe)
        ) {
          if (e.nodeName) {
            const t = pt(e.nodeName);
            if (!Ne[t] || ve[t])
              throw b(
                "root node is forbidden and cannot be sanitized in-place"
              );
          }
        } else if (e instanceof R)
          (n = _t("\x3c!----\x3e")),
            (r = n.ownerDocument.importNode(e, !0)),
            (r.nodeType === J && "BODY" === r.nodeName) || "HTML" === r.nodeName
              ? (n = r)
              : n.appendChild(r);
        else {
          if (!Fe && !ke && !ze && -1 === e.indexOf("<"))
            return le && We ? le.createHTML(e) : e;
          if (((n = _t(e)), !n)) return Fe ? null : We ? ce : "";
        }
        n && He && Et(n.firstChild);
        const c = St(Xe ? e : n);
        for (; (i = c.nextNode()); )
          wt(i), vt(i), i.content instanceof s && Lt(i.content);
        if (Xe) return e;
        if (Fe) {
          if (Be)
            for (l = me.call(n.ownerDocument); n.firstChild; )
              l.appendChild(n.firstChild);
          else l = n;
          return (
            (we.shadowroot || we.shadowrootmode) && (l = fe.call(a, l, !0)), l
          );
        }
        let m = ze ? n.outerHTML : n.innerHTML;
        return (
          ze &&
            Ne["!doctype"] &&
            n.ownerDocument &&
            n.ownerDocument.doctype &&
            n.ownerDocument.doctype.name &&
            S(K, n.ownerDocument.doctype.name) &&
            (m = "<!DOCTYPE " + n.ownerDocument.doctype.name + ">\n" + m),
          ke &&
            u([he, ge, Te], (e) => {
              m = y(m, e, " ");
            }),
          le && We ? le.createHTML(m) : m
        );
      }),
      (o.setConfig = function () {
        gt(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}),
          (Pe = !0);
      }),
      (o.clearConfig = function () {
        (ft = null), (Pe = !1);
      }),
      (o.isValidAttribute = function (e, t, n) {
        ft || gt({});
        const o = pt(e),
          r = pt(t);
        return Ot(o, r, n);
      }),
      (o.addHook = function (e, t) {
        "function" == typeof t && f(de[e], t);
      }),
      (o.removeHook = function (e, t) {
        if (void 0 !== t) {
          const n = m(de[e], t);
          return -1 === n ? void 0 : d(de[e], n, 1)[0];
        }
        return p(de[e]);
      }),
      (o.removeHooks = function (e) {
        de[e] = [];
      }),
      (o.removeAllHooks = function () {
        de = {
          afterSanitizeAttributes: [],
          afterSanitizeElements: [],
          afterSanitizeShadowDOM: [],
          beforeSanitizeAttributes: [],
          beforeSanitizeElements: [],
          beforeSanitizeShadowDOM: [],
          uponSanitizeAttribute: [],
          uponSanitizeElement: [],
          uponSanitizeShadowNode: [],
        };
      }),
      o
    );
  })();
  return re;
});
//# sourceMappingURL=purify.min.js.map

(function (window, document, E, undefined) {
  "use strict";

  window.AB = {
    // deep extend function
    extend: function () {
      const extended = {};
      let deep = false;
      let i = 0;
      const length = arguments.length;

      if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
        deep = arguments[0];
        i++;
      }

      const merge = function (obj) {
        for (const prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (
              deep &&
              Object.prototype.toString.call(obj[prop]) === "[object Object]"
            ) {
              extended[prop] = window.AB.extend(
                true,
                extended[prop],
                obj[prop]
              );
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };

      for (; i < length; i++) {
        merge(arguments[i]);
      }

      return extended;
    },

    // test if a string is a JSON
    isJson: function (str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },

    runUpdaters: function (plugin) {
      if (window.AB.options[plugin]) {
        window.AB.plugins[plugin](window.AB.options[plugin]);
      } else {
        for (const options in AB.options) {
          if (window.AB.options.hasOwnProperty(options)) {
            window.AB.plugins[options](window.AB.options[options]);
          }
        }
      }
    },

    plugins: {},
    options: {},
  };

  /* -------------------------------------------------- */

  window.abMediaQuery = function (mediaQueries) {
    if (typeof mediaQueries === "undefined") {
      return;
    }

    const mqKeys = Object.keys(mediaQueries);

    // get all media queries matching the current viewport
    const _getCurrents = function () {
      const sizes = [];

      mqKeys.forEach((key) => {
        if (window.matchMedia(mediaQueries[key]).matches) {
          sizes.push(key);
        }
      });

      return sizes;
    };

    // get current media query
    let _currentStore = _getCurrents();

    // update status only when our media queries are updated
    const _updateSizes = function () {
      const newSize = _getCurrents();

      // check if it's really updated
      if (newSize.join() !== _currentStore.join()) {
        _currentStore = newSize;
        window.dispatchEvent(new CustomEvent("changed.ab-mediaquery"));
      }
    };

    const is = function (size) {
      return mediaQueries[size]
        ? window.matchMedia(mediaQueries[size]).matches
        : false;
    };

    // listen for mediaQuery changes
    mqKeys.forEach((key) => {
      const mediaQuery = window.matchMedia(mediaQueries[key]);
      // .addEventListener("change", _updateSizes)

      try {
        // navigateurs modernes
        mediaQuery.addEventListener("change", _updateSizes);
      } catch (error) {
        // iOS < 14
        mediaQuery.addListener(_updateSizes);
      }
    });

    window.AB.mediaQuery = {
      get current() {
        return _currentStore;
      },
      is,
      queries: mediaQueries,
    };
  };

  /* -------------------------------------------------- */

  const pluginName = "interchange";
  const attr = "data-ab-interchange";
  const attrSrc = attr + "-src";

  const Plugin = function (el, options) {
    this.el = el;

    const dataOptions = window.AB.isJson(this.el.getAttribute(attr))
      ? JSON.parse(this.el.getAttribute(attr))
      : {};
    this.settings = window.AB.extend(
      true,
      Plugin.defaults,
      options,
      dataOptions
    );

    this.rules = [];
    this.currentPath = "";
    this.settings.mode = this._defineMode();
    this.lazySettings = this.settings.lazySettings;
    this.isLazy = this.settings.lazy;
    this.replaced = false;
    this.lazyTimer = null; // for delayed setTimeout
    this._inView = false;

    this.init();
  };

  Plugin.defaults = {
    mode: "background",
    lazy: false,
    lazySettings: {
      placeholder: false,
      delayed: false,
      layout: "fluid", // 'fixed': fixed dimensions
    },
  };

  Plugin.prototype = {
    init: function () {
      // no need when using 'picture' on browsers supporting that, except when using lazy loading
      if (
        this.el.parentNode.matches("picture") &&
        window.HTMLPictureElement &&
        !this.isLazy
      ) {
        return this;
      }

      if (this.isLazy) {
        this.observer = new IntersectionObserver(
          this._onIntersection.bind(this),
          {
            rootMargin: "300px 0px",
            threshold: 0,
          }
        );

        this.observer.observe(this.el);
      }

      // replace anyway after a delay (for offline support)
      if (this.isLazy && this.lazySettings.delayed) {
        this.lazyTimer = setTimeout(() => {
          this._inView = true;
          this._replace();
        }, this.lazySettings.delayed);
      }

      this._setPlaceholder()._events()._generateRules();

      if (this._updatePath()) {
        this._replace();
      }
    },

    _onIntersection: function (entries) {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          this.observer.unobserve(entry.target);
          this._inView = true;
          this._replace();
        }
      });
    },

    _defineMode: function () {
      // in case of <img /> there is no doubt
      if (this.el.nodeName === "IMG" || this.el.parentNode.matches("picture")) {
        return "img";
      }

      return this.settings.mode;
    },

    _getWidthHeight: function () {
      let width = this.el.getAttribute("width");
      let height = this.el.getAttribute("height");
      let widthObj = {};
      let heightObj = {};

      if (window.AB.isJson(width) && window.AB.isJson(height)) {
        widthObj = JSON.parse(width);
        heightObj = JSON.parse(height);

        for (const key in widthObj) {
          if (widthObj.hasOwnProperty(key)) {
            if (window.AB.mediaQuery.is(key)) {
              width = widthObj[key];
              height = heightObj[key];
            }
          }
        }
      }

      return {
        width: width,
        height: height,
      };
    },

    _setPlaceholder: function () {
      const placeholderNode = document.createElement("div");
      const imgNode = document.createElement("img");
      const alt = this.el.getAttribute("alt");
      const widthHeight = this._getWidthHeight();
      const width = widthHeight.width;
      const height = widthHeight.height;
      const ratio = height / width;
      const isNotReady =
        !this.lazySettings.placeholder ||
        this.el.nodeName === "IMG" ||
        this.el.parentNode.matches("picture") ||
        !width ||
        !height;

      if (isNotReady) {
        return this;
      }

      this.el.innerHTML = "";

      this.el.style.overflow = "hidden";
      this.el.style.position = "relative";
      this.el.classList.add("ab-interchange-loading");

      if (this.lazySettings.layout === "fixed") {
        this.el.style.width = width + "px";
        this.el.style.maxWidth = "100%";

        // calcul si width > maxWidth
        // this.el.style.height = this.el.offsetWidth * ratio + "px";
        this.el.style.height = "auto";
      }

      placeholderNode.classList.add("ab-interchange-placeholder");
      placeholderNode.style.paddingTop = ratio * 100 + "%";

      Object.assign(imgNode.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      });
      imgNode.alt = alt === null ? "" : alt; // always put an 'alt'

      this.el.appendChild(placeholderNode);
      this.el.appendChild(imgNode);

      return this;
    },

    _events: function () {
      // update path, then replace
      window.addEventListener(
        "changed.ab-mediaquery",
        this._resetDisplay.bind(this)
      );

      return this;
    },

    _generateRules: function () {
      const rulesList = [];
      // retro compatibility: sources inside 'attr'
      const getAttrSrc = this.el.getAttribute(attrSrc)
        ? this.el.getAttribute(attrSrc)
        : this.el.getAttribute(attr);
      const rules = getAttrSrc.match(/\[[^\]]+\]/g);

      rules.forEach((rule) => {
        const thisRule = rule.slice(1, -1).split(", ");
        const path = thisRule.slice(0, -1).join("");
        const query = thisRule[thisRule.length - 1];

        rulesList.push({
          path: path,
          query: query,
        });
      });

      this.rules = rulesList;

      return this;
    },

    _updatePath: function () {
      let path = "";
      const rules = this.rules;

      // if already replaced, we stop
      if (this.replaced) {
        return false;
      }

      // Iterate through each rule
      rules.forEach((rule) => {
        if (window.AB.mediaQuery.is(rule.query)) path = rule.path;
      });

      // if path hasn't changed, return
      if (this.currentPath === path) {
        return false;
      }

      this.currentPath = path;

      return true;
    },

    _resetDisplay: function () {
      this.replaced = false;

      if (this._updatePath()) {
        this._setPlaceholder();
        this._replace();
      }
    },

    _triggerEvent: function () {
      this.el.classList.remove("ab-interchange-loading");
      var event = new CustomEvent("replaced.ab-interchange", {
        detail: {
          element: this.el,
        },
      });
      window.dispatchEvent(event);
    },

    _replace: function () {
      // if lazy load and not into view: stop
      if (this.isLazy && !this._inView) {
        return this;
      }

      if (this.settings.mode === "img") {
        this._replaceImg();
      } else if (this.settings.mode === "background") {
        this._replaceBackground();
      }

      // we are done
      this.replaced = true;
    },

    _replaceImg: function () {
      let replaceNode;

      if (this.lazySettings.placeholder) {
        replaceNode = this.el.querySelector("img");
      } else {
        replaceNode = this.el;
      }

      if (replaceNode.src === this.currentPath) {
        return this;
      }

      replaceNode.src = this.currentPath;

      replaceNode.addEventListener("load", this._triggerEvent.bind(this));
    },

    _replaceBackground: function () {
      if (this.el.style.backgroundImage === 'url("' + this.currentPath + '")') {
        return this;
      }

      if (this.currentPath) {
        this.el.style.backgroundImage = "url(" + this.currentPath + ")";
      } else {
        this.el.style.backgroundImage = "none";
      }

      this.el.addEventListener("load", this._triggerEvent.bind(this));
    },
  };

  window.abInterchange = function (options) {
    const elements = document.querySelectorAll("[" + attr + "]");

    elements.forEach((element) => {
      if (!element[pluginName]) {
        element[pluginName] = new Plugin(element, options);
      }
    });
  };
})(window, document, window.E || {});

(function (window, undefined) {
  "use strict";

  const MyDOMPurify = window.DOMPurify;

  try {
    window._longTasks = [];
    new window.PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        window._longTasks.push(entry.toJSON());
      });
    }).observe({ entryTypes: ["longtask"] });
  } catch (error) {}

  // IE8 needs the console object to be created
  if (!window.console) {
    window.console = {
      log: function () {},
      warn: function () {},
      error: function () {},
      time: function () {},
      debug: function () {},
      timeEnd: function () {},
    };
  }

  // Create E global object
  // Use it to store variables, functions, etc...
  window.E = {
    version: "<% version %>", // remplacé via gulp-replace par le tag de version
    updaters: {}, // utilisé pour réinitialiser les plugin après réponse ajax
    plugins: {}, // on garde les fonctions d'appel des plugins (pour les évboquer après un appel Ajax par ex.)
    test: {}, // modernizr-like
    DOMPurify: MyDOMPurify, // pour purifier le HTML
    launchUpdaters: () => {
      // Pour reinitialiser les plugins en cas d'update du DOM (AJAX...)
      for (let key in E.updaters) {
        if (!E.updaters.hasOwnProperty(key)) continue;
        E.updaters[key]();
      }

      // init des faux boutons
      E.fakeBtn();
    },
  };

  // gestion focus et navigation au clavier (a11y)
  const axsStyles = (
    document.head || document.getElementsByTagName("head")[0]
  ).appendChild(document.createElement("style"));
  document.documentElement.classList.add("no-kbNavigation");
  axsStyles.innerHTML = "* {outline:none;}";

  document.addEventListener("mousedown", () => {
    if (E.test.kbNavigation) {
      E.test.kbNavigation = false;
      axsStyles.innerHTML = "* {outline:none;}";
      document.documentElement.classList.replace(
        "kbNavigation",
        "no-kbNavigation"
      );
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.code === "Tab" && !E.test.kbNavigation) {
      E.test.kbNavigation = true;
      axsStyles.innerHTML =
        "*:focus {outline: 2px auto #000; outline-offset: 2px;}";
      document.documentElement.classList.replace(
        "no-kbNavigation",
        "kbNavigation"
      );
    }
  });

  // Event pour remplacer 'load' sur window (parfois bloqué par des scripts tiers...)
  function triggerTimeoutReady(e) {
    const event = new CustomEvent("readyPlayerOne");

    if (E.triggerTimeoutReady) return;

    if (e.type === "load") {
      E.triggerTimeoutReady = true;
      document.dispatchEvent(event);
      return;
    }

    setTimeout(() => {
      if (E.triggerTimeoutReady) return;

      E.triggerTimeoutReady = true;
      document.dispatchEvent(event);
    }, 2000);
  }

  document.addEventListener("DOMContentLoaded", triggerTimeoutReady);
  window.addEventListener("load", triggerTimeoutReady);
})(window);

/*
test.js
*/

(function (window, document, E, undefined) {
  "use strict";

  // iOS
  if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && !window.MSStream) {
    E.test.ios = true;
    document.documentElement.classList.add("ios");
  } else {
    E.test.ios = false;
    document.documentElement.classList.add("no-ios");
  }

  // IE11
  if (!!window.MSInputMethodContext && !!document.documentMode) {
    E.test.ie11 = true;
    document.documentElement.classList.add("ie11");
  } else {
    E.test.ie11 = false;
    document.documentElement.classList.add("no-ie11");
  }

  // Android
  if (navigator.userAgent.match(/android/i)) {
    E.test.android = true;
    document.documentElement.classList.add("android");
  } else {
    E.test.android = false;
    document.documentElement.classList.add("no-android");
  }

  // localStorage / sessionStorage
  try {
    localStorage.setItem("testStorage", "true");
    localStorage.removeItem("testStorage");

    E.test.localstorage = true;
    document.documentElement.classList.add("localstorage");
  } catch (t) {
    E.test.localstorage = false;
    document.documentElement.classList.add("no-localstorage");
  }

  // touchevents
  var touchevents = "ontouchstart" in window;
  E.test.touchevents = touchevents;
  document.documentElement.classList.add(
    touchevents ? "touchevents" : "no-touchevents"
  );

  // DarkMode
  function switchDarkMode(status) {
    document.documentElement.classList[status.matches ? "add" : "remove"](
      "darkMode--on"
    );
    E.isDarkMode = status.matches;
  }

  if (window.matchMedia("(prefers-color-scheme)").media !== "not all") {
    var darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    E.test.darkMode = true;
    document.documentElement.classList.add("darkMode");
    switchDarkMode(darkModeMediaQuery);

    darkModeMediaQuery.addListener(switchDarkMode);
  } else {
    E.test.darkMode = false;
    document.documentElement.classList.add("no-darkMode");
  }

  // JavaScript
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
})(window, document, window.E || {});

/*
clipboard.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.clipboard = {
    copy: function (val) {
      var inputNode = document.createElement("input");

      document.body.appendChild(inputNode);
      inputNode.value =
        typeof val === "string" ? val : val.value ? val.value : val.textContent;
      inputNode.select();
      document.execCommand("copy");
      inputNode.remove();
    },
  };
})(window, document, window.E || {});

/*
debounce.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.debounce = function (callback, delay) {
    var timer;

    return function () {
      var args = arguments,
        that = this;

      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        callback.apply(that, args);
      }, delay);
    };
  };

  // debounce rapide via requestAnimationFrame
  var debounce = function (type, name) {
    var running = false;

    var func = function () {
      if (running) return;

      running = true;
      window.requestAnimationFrame(function () {
        window.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    window.addEventListener(type, func);
  };

  /* init - you can init any event */
  debounce("resize", "E-resize");
  debounce("scroll", "E-scroll");
  debounce("mousemove", "E-mousemove");
  debounce("touchmove", "E-touchmove");
})(window, document, window.E || {});

/*
  encrypt.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.encrypt = {
    hexa: function (string) {
      return string
        .split("")
        .map(function (char) {
          return char.charCodeAt(0).toString(16).padStart(2, "0");
        })
        .join("");
    },
  };
})(window, document, window.E || {});

/*
extend.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.extend = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
      deep = arguments[0];
      i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // If deep merge and property is an object, merge properties
          if (
            deep &&
            Object.prototype.toString.call(obj[prop]) === "[object Object]"
          ) {
            extended[prop] = E.extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    // Loop through each object and conduct a merge
    for (; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }

    return extended;
  };
})(window, document, window.E || {});

/*
  fakeBtn.js

  Description:
  -----------
  Quand un bouton n'est pas possible (uniquement dans ce cas !!!)
*/

(function (window, document, E, undefined) {
  "use strict";

  var initFakeBtn = function (node) {
    // inutile d'init plusieurs fois un fakeBtn
    if (node.eFakebtn) return;

    node.eFakebtn = true;
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");

    node.addEventListener("keypress", function (ev) {
      if (ev.keyCode === 32 || ev.keyCode === 13) {
        node.click();
      }
    });
  };

  E.fakeBtn = function () {
    var fakeBtnNodes = document.querySelectorAll("[data-e-fakebtn]");
    fakeBtnNodes.forEach(initFakeBtn);
  };
})(window, document, window.E || {});

/** fetchHelper.js */

/**
 * Fonction utilitaire pour gérer la soumission de formulaire avec l'API fetch.
 * @param {Object} params - Les paramètres pour la requête fetch.
 * @param {HTMLFormElement} params.formNode - Le nœud du formulaire à partir duquel l'événement est dispatché.
 * @param {string} params.action - L'URL à laquelle la requête est envoyée.
 * @param {string} params.method - La méthode HTTP à utiliser pour la requête.
 * @param {Object} params.body - Le corps de la requête, sera converti en chaîne JSON.
 * @param {string} params.responseFormat - Le format de la réponse : "json", "formData".
 * @param {Function} params.onValid - Fonction de rappel pour gérer une réponse valide.
 * @param {Function} params.onError - Fonction de rappel pour gérer une réponse d'erreur.
 * @param {Function} params.toggleLoading - Fonction pour basculer l'état de chargement.
 */
(function (window, document, E, undefined) {
  E.fetchHelper = async ({
    formNode,
    action,
    method = "GET",
    body,
    responseFormat = "json",
    onValid = () => {},
    onError = () => {},
    toggleLoading = () => {},
  }) => {
    if (!formNode || !action) {
      console.error("E.fetchHelper: formNode et action sont obligatoires");
    }

    let status;
    let responseData;

    const dispatchEvent = (event) =>
      formNode.dispatchEvent(new CustomEvent(`fetchHelper.${event}`));
    const headers = {};
    const options = { method, headers };

    if (responseFormat === "json") {
      headers["Content-Type"] = "application/json";
    }

    if (method.toUpperCase() !== "GET") {
      if (responseFormat === "json") {
        options.body = JSON.stringify(body);
      } else if (responseFormat === "formData") {
        options.body = body;
      }
    }

    toggleLoading(true);

    try {
      const response = await fetch(action, options);

      if (responseFormat === "json") {
        if (response.ok) {
          responseData = await response.json();
          onValid(responseData);
          dispatchEvent("success");
        } else {
          responseData = await response.json();
          status = response.status;
          throw new Error("Server Error");
        }

        return;
      }

      if (response.ok) {
        onValid();
        dispatchEvent("success");
      } else {
        status = response.status;
        throw new Error("Server Error");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      onError(responseData, status);
      dispatchEvent("error");
    } finally {
      toggleLoading(false);
    }
  };
})(window, document, window.E || {});

/*
  getCoords.js

  Description:
  -----------
  Retourne la position (X et Y) d'un élément par rapport au document
*/

(function (window, document, E, undefined) {
  "use strict";

  E.getCoords = function (el) {
    // crossbrowser version
    var box = el.getBoundingClientRect(),
      body = document.body,
      docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {
      top: Math.round(top),
      left: Math.round(left),
    };
  };
})(window, document, window.E || {});

/*
  getUrlParameter.js

  Description:
  -----------
  Récupérer la valeur d'un paramètre dans l'URL

  JS usage:
  --------
  E.getUrlParameter('toto');
*/

(function (window, document, E, undefined) {
  "use strict";

  E.getUrlParameter = (paramName) => {
    const paramsString = window.location.search.substring(1);

    if (paramsString.length === 0) return paramName ? "" : [];

    const paramList = paramsString.split("&");
    const paramStore = [];
    let param = [];
    let obj = {};

    for (let i = 0, len = paramList.length; i < len; i++) {
      param = paramList[i].split("=");

      if (paramName) {
        if (param[0] === paramName) {
          return param[1];
        }
      } else {
        obj = {};
        obj[param[0]] = param[1];
        paramStore.push(obj);
      }
    }

    if (!paramName) return paramStore;
  };
})(window, document, window.E || {});

/*
intersectionInjectClass.js
Ne pas utiliser directement sur le node à dynamiser car cela va fausser l'intersection à cause du mouvement
*/

(function (window, document, E, undefined) {
  "use strict";

  const PLUGIN_NAME = "eIntersectionInjectClass";
  const ATTR = "data-e-intersectioninjectclass";
  const DEFAULTS = {
    replay: false,
    observerOptions: {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    },
  };

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          window.requestAnimationFrame(() => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-intersecting");

              this.el.dispatchEvent(
                new CustomEvent("eIntersectionInjectClass.in", {
                  detail: {
                    instance: this,
                  },
                })
              );
            } else if (this.settings.replay) {
              entry.target.classList.remove("is-intersecting");

              this.el.dispatchEvent(
                new CustomEvent("eIntersectionInjectClass.out", {
                  detail: {
                    instance: this,
                  },
                })
              );
            }
          });
        });
      };

      const observer = new IntersectionObserver(
        observerCallback,
        this.settings.observerOptions
      );

      observer.observe(this.el);
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    E.factory.createPlugin(PLUGIN_NAME, ATTR, DEFAULTS, Plugin);
  });
})(window, document, window.E || {});

/*
isJson.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.isJson = function (str) {
    try {
      str = JSON.parse(str);
    } catch (e) {
      return false;
    }

    // str doit être un object et pas null
    if (typeof str === "object" && str !== null) {
      return true;
    }

    return false;
  };
})(window, document, window.E || {});

/*
  isValidDate.js

  Description:
  -----------
  Vérifie la validité d'une date

  options:
  --------
  {
    instance: flatpickr instance,
    dateFormat: format de la date,
  }
*/

(function (window, document, E, undefined) {
  "use strict";

  E.isValidDate = function (dateString, options) {
    // "d/m/Y" : 04/05/2024
    if (!options || options.dateFormat === "d/m/Y") {
      const regex_date = /^(\d{2}|\d{1})\/(\d{2}|\d{1})\/\d{4}$/;
      let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      if (!regex_date.test(dateString)) {
        return false;
      }

      const parts = dateString.split("/");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (year < 1000 || year > 3000 || month === 0 || month > 12) {
        return false;
      }

      if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
        monthLength[1] = 29;
      }

      return day > 0 && day <= monthLength[month - 1];
    }

    // "m/Y" : 05/2024
    if (!options || options.dateFormat === "m/Y") {
      const regex_date = /^(0[1-9]|1[0-2])\/\d{4}$/;

      if (!regex_date.test(dateString)) {
        return false;
      }

      const parts = dateString.split("/");
      const month = parseInt(parts[0], 10);
      const year = parseInt(parts[1], 10);

      if (year < 1000 || year > 3000 || month === 0 || month > 12) {
        return false;
      } else {
        return true;
      }
    }

    // "F Y" : mai 2024
    if (options && options.dateFormat === "F Y") {
      const regex_date = /^([A-Za-zéû]{3,9}) \d{4}$/;
      const monthNames = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];

      if (!regex_date.test(dateString)) {
        return false;
      }

      const parts = dateString.split(" ");
      const month = parts[0];
      const year = parseInt(parts[1], 10);

      return monthNames.includes(month) && year >= 1000 && year <= 3000;
    }
  };
})(window, document, window.E || {});

/*
  keyName.js

  Description:
  -----------
  Keycodes (qui se souvient des keycodes ?)

  JS usage:
  --------
  document.addEventListener('keydown', function(e) {
    var keycode = e.which;
    if (E.keyNames[keycode] === 'escape') {
      // ...
    }
  });
*/

(function (window, document, E, undefined) {
  "use strict";

  E.keyNames = {
    40: "down",
    38: "up",
    37: "left",
    39: "right",
    9: "tab",
    17: "ctrl",
    13: "enter",
    27: "escape",
    32: "space",
    33: "prev",
    34: "next",
    36: "start",
    35: "end",
    16: "shift",
  };
})(window, document, window.E || {});

/*
morphing.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var _getPos = function (elem, context) {
    var position = {};
    var elemPos = elem.getBoundingClientRect();

    position.top = elemPos.top - context.top;
    position.left = elemPos.left - context.left;
    position.width = elemPos.width;
    position.height = elemPos.height;

    return position;
  };

  E.morphing = function (elem, params) {
    var fakeNode = elem;
    var params = params;
    var contextNode = params.context;
    var originNode = params.origin;
    var targetNode = params.target;

    // Vérifier option mobile:
    if (params.noMobile && AB.mediaQuery.is("smallOnly")) return;

    var _inTheEnd = function (e) {
      if (
        e.propertyName === "width" ||
        e.propertyName === "left" ||
        e.propertyName === "height"
      ) {
        fakeNode.removeAttribute("style");
        fakeNode.classList.remove("is-morphing-move");
        contextNode.classList.remove("is-morphing");

        fakeNode.removeEventListener("transitionend", _inTheEnd);
      }
    };

    var contextPos = contextNode.getBoundingClientRect();
    var originPos = _getPos(originNode, contextPos);
    var targetPos = _getPos(targetNode, contextPos);

    //--- Animations:
    contextNode.classList.add("is-morphing");
    fakeNode.classList.add("is-morphing-move");

    fakeNode.style.top = originPos.top + "px";
    fakeNode.style.left = originPos.left + "px";
    fakeNode.style.width = originNode.offsetWidth + "px";
    fakeNode.style.height = originNode.offsetHeight + "px";

    window.setTimeout(function () {
      fakeNode.style.top = targetPos.top + "px";
      fakeNode.style.left = targetPos.left + "px";
      fakeNode.style.width = targetNode.offsetWidth + "px";
      fakeNode.style.height = targetNode.offsetHeight + "px";
    }, 20);

    fakeNode.addEventListener("transitionend", _inTheEnd);
  };
})(window, document, window.E || {});

/*
  noScroll.js

  Assigner l'attribut [data-e-noscroll] au wrapper du contenu du site pour éviter un effet de scroll
*/

function goTo(top) {
  try {
    window.scrollTo({ left: 0, top: top, behavior: "instant" });
  } catch (err) {
    window.scrollTo(0, top);
  }
}

(function (window, document, E, undefined) {
  "use strict";

  E.noScroll = {
    siteWrapperAttr: "[data-e-no-scroll]",
    noScrollClass: "no-scroll",
    currentPos: 0,

    prevent: function () {
      const siteWrapper = document.querySelectorAll(this.siteWrapperAttr);
      const scrollBarWidth =
        window.innerWidth - document.documentElement.offsetWidth;
      this.currentPos = window.pageYOffset;

      document.documentElement.classList.add(this.noScrollClass);

      if (E.test.touchevents) {
        // si pas de wrapper, on applique au body
        if (siteWrapper.length <= 0) {
          document.body.style.position = "fixed";
          document.body.style.top = -this.currentPos + "px";
          document.body.style.left = 0;
          document.body.style.right = 0;
          return;
        }

        siteWrapper.forEach((item) => {
          item.style.position = "fixed";
          item.style.top = -this.currentPos + "px";
          item.style.left = 0;
          item.style.right = 0;
        });
      } else {
        document.documentElement.style.paddingRight = scrollBarWidth + "px";
      }
    },

    allow: function () {
      const siteWrapper = document.querySelectorAll(this.siteWrapperAttr);

      document.documentElement.classList.remove(this.noScrollClass);

      if (E.test.touchevents) {
        if (!siteWrapper.length) {
          document.body.style.position = "static";
          goTo(this.currentPos);
          return;
        }

        siteWrapper.forEach((item) => (item.style.position = "static"));

        goTo(this.currentPos);
      } else {
        document.documentElement.style.paddingRight = "";
      }
    },
  };
})(window, document, window.E || {});

/*
  populate.js

  test: https://codepen.io/lordfpx/pen/jQBvqZ?editors=0010
*/

(function (window, document, E, undefined) {
  "use strict";

  const populateForm = function (form, name, value) {
    const element = form.elements.namedItem(name);

    // Vérification si l'élément existe
    if (!element) return;

    const type = element.type || (element[0] && element[0].type);

    // Vérification null/undefined
    if (value === undefined || value === null) {
      value = "";
    }

    if (element._flatpickr) {
      element._flatpickr.setDate(value, true);
    } else {
      switch (type) {
        case "radio":
          Array.from(element).forEach(function (node) {
            node.checked = value.indexOf(node.value) > -1;
          });
          break;

        case "checkbox":
          if (element.length) {
            Array.from(element).forEach((node) => {
              if (value.length) {
                node.checked = value.includes(node.value);
              } else {
                node.checked = element.value === value;
              }
            });
          } else {
            element.checked = value === true || element.value === value;
          }
          break;

        case "select-multiple":
          var values = Array.isArray(value) ? value : [value];
          if (element.tagName === "SELECT") {
            element.querySelectorAll("option").forEach((option) => {
              option.selected = values.indexOf(option.value) > -1;
            });
          } else {
            Array.from(element).forEach(function (node) {
              node.querySelectorAll("option").forEach((option) => {
                option.selected = values.indexOf(option.value) > -1;
              });
            });
          }
          break;

        case "select":
        case "select-one":
          let option = null;
          if (element.tagName === "SELECT") {
            option = element.querySelector('[value="' + (value || "") + '"]');
            if (option) option.selected = true;
          } else {
            Array.from(element).forEach(function (node) {
              option = node.querySelector('[value="' + (value || "") + '"]');
              if (option) option.selected = true;
            });
          }
          break;

        case "date":
          let date = null;
          if (element.length) {
            Array.from(element).forEach(function (node) {
              date = new Date(value);
              if (!isNaN(date)) {
                node.value = date.toISOString().split("T")[0];
              }
            });
          } else {
            date = new Date(value);
            if (!isNaN(date)) {
              element.value = date.toISOString().split("T")[0];
            }
          }
          break;

        default:
          if (element.length) {
            Array.from(element).forEach((node) => {
              node.value = value;
            });
          } else {
            element.value = value;
          }
          break;
      }
    }

    form.dispatchEvent(
      new CustomEvent("ePopulate.field", {
        detail: {
          name: name,
          value: value,
          element: element,
        },
      })
    );
  };

  E.populate = function (form, data) {
    for (var key in data) {
      if (data.hasOwnProperty(key) && form.elements.namedItem(key)) {
        populateForm(form, key, data[key]);
      }
    }

    form.dispatchEvent(new CustomEvent("ePopulate.done"));
  };
})(window, document, window.E || {});

// polyfill pour replaceChildren
// https://github.com/yuzhe-han/ParentNode-replaceChildren

(function () {
  if (Node.prototype.replaceChildren === undefined) {
    Node.prototype.replaceChildren = (addNodes) => {
      while (this.lastChild) {
        this.removeChild(this.lastChild);
      }
      if (addNodes !== undefined) {
        this.append(addNodes);
      }
    };
  }
})();

/*
  screenTransition.js
*/

(function (window, document, E, undefined) {
  ("use strict");

  /**
   * Fonction permettant de gérer les transitions d'écrans
   * Attention de prévoir un élément wrapper pour le contenu
   *
   * @param {HTMLElement} originNode - écran à faire disparaitre
   * @param {HTMLElement} destinationNode - écran à faire apparaître
   * @param {function} [callback] - fonction à exécuter après la transition
   */
  E.screenTransition = function (originNode, destinationNode, callback) {
    const duration = 500;
    const wrapperNode = originNode.parentNode;

    if (
      !originNode ||
      !destinationNode ||
      !wrapperNode ||
      originNode === destinationNode
    ) {
      if (callback) {
        callback();
      }

      return;
    }

    Object.assign(wrapperNode.style, {
      height: `${originNode.offsetHeight}px`,
      willChange: "height",
      transition: `all ${duration}ms ease-in-out`,
    });

    const initOriginNode = function (node) {
      node.setAttribute("tabindex", "-1");

      Object.assign(node.style, {
        position: "absolute",
        padding: "inherit",
        zIndex: "0",
        left: "0",
        right: "0",
        top: "0",
        transition: `all ${duration}ms ease-in-out`,
      });
    };

    const initDestinationNode = function (node) {
      node.setAttribute("tabindex", "-1");
      node.hidden = false;

      Object.assign(node.style, {
        position: "absolute",
        zIndex: "1",
        opacity: "0",
        left: "0",
        right: "0",
        top: "0",
        padding: "inherit",
        transform: "translateY(-20px)",
        transition: `all ${duration}ms ease-in-out`,
      });
    };

    const updateOriginNode = function (node) {
      Object.assign(node.style, {
        transform: "translateY(-20px)",
        opacity: "0",
      });

      setTimeout(() => {
        node.hidden = true;
        node.removeAttribute("style");
      }, duration);
    };

    const updatedestinationNode = function (node) {
      wrapperNode.style.height = `${node.offsetHeight}px`;

      Object.assign(node.style, {
        transform: "translateY(0)",
        opacity: "1",
      });

      setTimeout(() => {
        node.focus({ preventScroll: true });
        node.removeAttribute("style");
        wrapperNode.removeAttribute("style");

        if (callback) {
          callback();
        }
      }, duration);
    };

    initDestinationNode(destinationNode);
    initOriginNode(originNode);

    // dirty hack
    setTimeout(() => {
      updatedestinationNode(destinationNode);
      updateOriginNode(originNode);
    }, 20);
  };
})(window, document, window.E || {});

/*
scrollTo.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.scrollTo = function (options) {
    // settings
    var next = options.next;
    var center = options.center || false;
    var offset = options.offset || 0;
    var duration = options.duration || 600;
    var wrapper = options.wrapper || false;
    var currentPosition = 0;
    var nextPosition = 0;
    var diffPosition = 0;
    var startTime = null;
    var currentTime = 0;
    var nextHeight = next.offsetHeight;
    var windowHeight = window.innerHeight;
    var bodyScrollTo =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

    // nécessaire pour Chrome
    var supportsPassive = false;
    try {
      window.addEventListener(
        "test",
        null,
        Object.defineProperty({}, "passive", {
          get: function () {
            supportsPassive = true;
          },
        })
      );
    } catch (e) {}
    var passiveOption = supportsPassive ? { passive: false } : false;

    // fonction de déplacement
    function move(val) {
      wrapper ? (wrapper.scrollTop = val) : window.scrollTo(0, val);
    }

    // fonction de easing
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) {
        return (c / 2) * t * t + b;
      }
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    // calcul animation avec requestAnimationFrame
    function animateScroll(time) {
      if (time === undefined) {
        time = new Date().getTime();
      }

      if (startTime === null) {
        startTime = time;
      }

      currentTime = time - startTime;

      // on scroll...
      var val = easeInOutQuad(
        currentTime,
        currentPosition,
        diffPosition,
        duration
      );
      move(val);

      // on continue jusqu'à la fin...
      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        window.removeEventListener("wheel", preventScroll, passiveOption);
        window.removeEventListener("touchmove", preventScroll, passiveOption);
      }
    }

    // on chercher un wrapper (modale par exemple) s'il n'est pas spécifié
    if (!wrapper) {
      if (AB.mediaQuery.is("smallOnly"))
        wrapper = next.closest(".c-fullModal, .c-modal__content");
      else wrapper = next.closest(".c-fullModal, .c-modal__overlay");
    }

    // si wrapper, on scroll le wrapper
    if (wrapper) {
      currentPosition = wrapper.scrollTop;
      nextPosition = next.offsetTop;
    } else {
      currentPosition = bodyScrollTo;
      nextPosition = E.getCoords(next).top;
    }

    // si l'étape est plus petite que la fenêtre, on centre
    if (center && nextHeight + offset < windowHeight) {
      nextPosition = nextPosition - windowHeight / 2 + nextHeight / 2;
    }

    nextPosition = nextPosition - offset;

    function preventScroll(e) {
      e.preventDefault();
    }

    window.addEventListener("wheel", preventScroll, passiveOption);
    window.addEventListener("touchmove", preventScroll, passiveOption);

    // on a besoin de la différence
    diffPosition = nextPosition - currentPosition;

    requestAnimationFrame(animateScroll);
  };
})(window, document, window.E || {});

/*
  serializeForm.js

  Description:
  Retourne une sérialisation de tous les éléments valides d'un formulaire et leurs valeurs.

  E.serializeForm(formNode)
  "formNode" étant un formulaire
*/

(function (window, document, E, undefined) {
  "use strict";

  function isRadioCheckbox(el) {
    return (
      el.getAttribute("type") === "checkbox" ||
      el.getAttribute("type") === "radio"
    );
  }

  E.serializeForm = function (formNode) {
    var items = {};
    var el = null;
    var formElsNode = formNode.elements;

    for (var i = 0, len = formElsNode.length; i < len; i++) {
      el = formElsNode[i];

      // enfant de fieldset disabled
      if (el.closest("fieldset") && el.closest("fieldset").disabled) continue;

      // disabled
      if (el.disabled) continue;

      // checkbox ou radio unchecked
      if (isRadioCheckbox(el) && !el.checked) continue;

      // fieldset, reset, submit, button
      if (el.type === "fieldset") continue;

      if (
        el.name &&
        (el.willValidate || el.readOnly === true || el.type === "hidden")
      ) {
        items[el.name] = el.value;
      }
    }

    return items;
  };
})(window, document, window.E || {});

/*
  storage.js

  Methods to get, set, remove storage (local/session).
  Cookies is used as fallback.

  LocalStorage will behave like cookie:

  - if localStorage is available:
    - if date: use localStorage
    - else: use sessionStorage

  - else localStorage is unvailable: cookie (through js-cookie: https://github.com/js-cookie/js-cookie)

  Storage with '-date' suffix is to mimic cookie expire.

  Aide:
  "E.storage.setItem(STRING, STRING[, NUMBER])":
    "Créer un storage, [NUMBER] est l'expiration en jours (si en heure: h/24). Si pas de [NUMBER], ce sera sessionStorage",

  "E.storage.getItem(STRING)":
    "Lire un storage",

  "E.storage.removeItem(STRING|ARRAY)":
    "Effacer un storage ou un array de storages",

  "E.storage.getItemsStartsWith(STRING)":
    "return un array de storages commençant par STRING"
*/

(function (window, document, E, undefined) {
  "use strict";

  // js-cookie respecte le norme RFC 6265, https://github.com/js-cookie/js-cookie#encoding, mais pas JBoss :-(
  E.Cookies = window.Cookies.withConverter({
    read: function (value, name) {
      return decodeURIComponent(value);
    },
    write: function (value, name) {
      return encodeURIComponent(value);
    },
  });

  E.storage = (function () {
    var hasLocalStorage = E.test.localstorage;

    /**
     * Get item and return its value || null
     * E.storage.getItem('toto');
     *
     * @param  {string} key
     */
    function getItem(key) {
      var data;

      if (E.debug) console.log("getItem", key);

      if (hasLocalStorage) {
        if (localStorage.getItem(key + "-date")) {
          data = window.localStorage.getItem(key);
        } else {
          data = window.sessionStorage.getItem(key);

          // si pas de seessionStorage && pas de date,
          // c'est peut être un localStorage normal ?
          if (!data) data = window.localStorage.getItem(key);
        }
      } else {
        // patch avant refonte TEL
        if (key.startsWith("VENTE-")) {
          data = E.Cookies.get(key.slice("VENTE-".length));
        } else {
          data = E.Cookies.get(key);
        }
      }

      return data ? data : null;
    }

    /**
     * Set item with optional expiration
     * if date expiration is set
     *    > remove session storage, overrid storage with same key that has date
     *    > create two localstorage, one with value, one with date expiration
     * if date is not set
     *    >  remove local storage, overrid storage with same key that has not date
     *    >  create session storage
     *
     * E.storage.setItem('toto', 'string' [, 10]);
     *
     * @param  {string} key
     * @param  {string} value
     * @param  {number} date
     */
    function setItem(key, value, date) {
      if (!key) return false;

      if (E.debug) console.log("setItem: ", key, value, date);

      if (hasLocalStorage) {
        if (date) {
          window.sessionStorage.removeItem(key);

          window.localStorage.setItem(key, value);
          window.localStorage.setItem(key + "-date", _calcDateExpires(date));
        } else {
          window.localStorage.removeItem(key);
          window.localStorage.removeItem(key + "-date");

          window.sessionStorage.setItem(key, value);
        }
      } else {
        // patch avant refonte TEL
        if (key.startsWith("VENTE-")) {
          E.Cookies.set(key.slice("VENTE-".length), value, { expires: date });
        } else {
          E.Cookies.set(key, value, { expires: date });
        }
      }
    }

    /**
     * remove item(s)
     * E.storage.removeItem('toto');
     * E.storage.removeItem(['toto', 'blabla']);
     *
     * @param  {string|Array} key - can be an item or an array of items
     */
    function removeItem(key) {
      if (E.debug) console.log("removeItem", key);

      if (Array.isArray(key)) {
        for (var i = 0, len = key.length; i < len; i++) {
          var item = key[i];
          window.localStorage.removeItem(item);
          window.localStorage.removeItem(item + "-date");
          window.sessionStorage.removeItem(item);
          E.Cookies.remove(item);

          // patch avant refonte TEL
          E.Cookies.remove(item.slice("VENTE-".length));
        }
      } else {
        window.localStorage.removeItem(key);
        window.localStorage.removeItem(key + "-date");
        window.sessionStorage.removeItem(key);
        E.Cookies.remove(key);

        // patch avant refonte TEL
        E.Cookies.remove(key.slice("VENTE-".length));
      }
    }

    /**
     * calculate date expiration (https://github.com/js-cookie/js-cookie/blob/master/src/js.cookie.js lines 53 + 79)
     * return string or empty string ''
     *
     * @param  {number} date
     */
    function _calcDateExpires(date) {
      var d = date;
      if (typeof date === "number") {
        var expires = new Date();
        expires.setMilliseconds(expires.getMilliseconds() + d * 864e5);
        d = expires.getTime();
      }

      return d ? d : "";
    }

    /**
     * get items that start with 'keyword', get local AND session storage with fallback cookie, push item in storageArray
     * return array or empty array
     *
     * @param  {string} keyword
     */
    function getItemsStartsWith(keyword) {
      var storageArray = [],
        keysLocal,
        keysSession,
        keysCookie,
        i,
        len,
        key;

      if (hasLocalStorage) {
        keysLocal = Object.keys(localStorage);
        keysSession = Object.keys(sessionStorage);

        for (i = 0, len = keysLocal.length; i < len; i++) {
          key = keysLocal[i];

          // if key begins with keyword
          if (key.startsWith(keyword)) storageArray.push(key);
        }

        for (i = 0, len = keysSession.length; i < len; i++) {
          key = keysSession[i];

          // if key begins with keyword
          if (key.startsWith(keyword)) storageArray.push(key);
        }
      } else {
        keysCookie = Object.keys(E.Cookies.get());

        for (i = 0, len = keysCookie.length; i < len; i++) {
          key = keysCookie[i];

          // if key begins with keyword
          if (key.startsWith(keyword)) storageArray.push(key);
        }
      }

      return storageArray;
    }

    return {
      getItem: getItem,
      setItem: setItem,
      removeItem: removeItem,
      getItemsStartsWith: getItemsStartsWith,
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    // simulate cookie expiration: localStorage only
    if (E.test.localstorage) {
      var keys = Object.keys(window.localStorage);

      for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];

        // if key has a date expiration, compare with today and remove local storage
        if (key.endsWith("-date")) {
          var localStorageDate = Date.parse(window.localStorage.getItem(key)),
            today = new Date(),
            storage = key.split("-date")[0];

          /* Pour faire des tests en local
            var nextMonth = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 30);
            today = nextMonth;
            */

          // verify if localStorageDate actually return a date value
          if (localStorageDate && today > localStorageDate) {
            // Effacer tous les localStorage VENTE (exception du comportement normal)
            if (key === "VENTE-storageDate-date") {
              E.storage.removeItem(E.storage.getItemsStartsWith("VENTE-"));
            }

            window.localStorage.removeItem(storage);
            window.localStorage.removeItem(key);
          }

          // remove useless item with date
          if (window.localStorage.getItem(storage) === null) {
            window.localStorage.removeItem(key);
          }
        }
      }
    }
  });
})(window, document, window.E || {});

(function (window, document, E, undefined) {
  "use strict";

  const DURATION = 0.083;

  E.telStorage = function (obj, callback) {
    if (obj.hasOwnProperty("removeStorage") && obj.removeStorage.length) {
      obj.removeStorage.forEach((storage) => {
        E.storage.removeItem(storage);
      });
    }

    if (obj.hasOwnProperty("setStorage") && obj.setStorage.length) {
      E.storage.setItem("VENTE-storageDate", new Date().getTime(), DURATION);

      obj.setStorage.forEach((storage) => {
        var key = Object.keys(storage)[0];
        E.storage.setItem(key, storage[key], DURATION);
      });
    }

    if (callback) setTimeout(callback, 5000);
  };
})(window, document, window.E || {});

// wrapper pour les chaînes déjà sanitizées
class SafeHtml {
  constructor(html) {
    this.html = html;
  }
}

// helper à utiliser en amont du template
function safeHtml(str) {
  const clean = E.DOMPurify.sanitize(str, {});
  return new SafeHtml(clean);
}

function tokenize(template) {
  // Récupère le texte et les blocs [% %] en tant que tokens
  const tokens = [];
  const regex = /\[\%([\s\S]*?)\%\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: template.slice(lastIndex, match.index),
      });
    }

    const codeContent = match[1].trim();
    const codeTokens = splitCode(codeContent);
    tokens.push(...codeTokens);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    tokens.push({ type: "text", value: template.slice(lastIndex) });
  }

  return tokens;
}

function splitCode(code) {
  // Découpe une chaîne de code en plusieurs sous-tokens (if, else, each, etc.)
  const tokens = [];
  const regex = /(\bif\b.*?\{|\belse\b.*?\{|\beach\b.*?\{|\}|[^{}]+)/gs;
  let match;

  while ((match = regex.exec(code)) !== null) {
    const tokenValue = match[0].trim();

    if (tokenValue) {
      if (tokenValue === "}") {
        tokens.push({ type: "code", value: "}" });
      } else if (/^if\b/.test(tokenValue)) {
        tokens.push({ type: "code", value: tokenValue });
      } else if (/^else\b/.test(tokenValue)) {
        tokens.push({ type: "code", value: tokenValue });
      } else if (/^each\b/.test(tokenValue)) {
        tokens.push({ type: "code", value: tokenValue });
      } else {
        tokens.push({ type: "expression", value: tokenValue });
      }
    }
  }
  return tokens;
}

function parseTokens(tokens) {
  // Parcourt les tokens et construit un AST
  let position = 0;

  function parse() {
    const ast = [];

    while (position < tokens.length) {
      const token = tokens[position];

      if (token.type === "text") {
        ast.push({ type: "TextNode", value: token.value });
        position++;
      } else if (token.type === "expression") {
        ast.push({ type: "ExpressionNode", value: token.value });
        position++;
      } else if (token.type === "code") {
        const code = token.value.trim();
        if (/^if\b/.test(code)) {
          ast.push(parseIf());
        } else if (/^else\b/.test(code)) {
          position++;
          return ast;
        } else if (/^each\b/.test(code)) {
          ast.push(parseEach());
        } else if (code === "}") {
          position++;
          return ast;
        } else {
          throw new Error(`Invalid code statement: ${code}`);
        }
      }
    }

    return ast;
  }

  function parseIf() {
    // Gère les blocs if(...){...} et leur else éventuel
    const token = tokens[position++];
    const match = token.value.match(/^if\s*\(([\s\S]*?)\)\s*\{$/);

    if (!match) {
      throw new Error(`Invalid if statement: ${token.value}`);
    }

    const condition = match[1];
    const consequent = parse();
    let alternate = null;

    if (
      position < tokens.length &&
      tokens[position].type === "code" &&
      /^else\b/.test(tokens[position].value.trim())
    ) {
      position++;
      alternate = parse();
    }

    return {
      type: "IfNode",
      condition,
      consequent,
      alternate,
    };
  }

  function parseEach() {
    // Gère la syntaxe each(... in ...)
    const token = tokens[position++];
    const match = token.value.match(
      /^each\s*\(\s*([a-zA-Z_]\w*)(?:\s*,\s*([a-zA-Z_]\w*))?\s+in\s+([\s\S]+)\)\s*\{$/
    );

    if (!match) {
      throw new Error(`Invalid each statement: ${token.value}`);
    }

    const firstVar = match[1];
    const secondVar = match[2];
    const collection = match[3];
    const body = parse();

    return {
      type: "EachNode",
      firstVar,
      secondVar,
      collection,
      body,
    };
  }

  return parse();
}

function evaluate(expression, context) {
  // Évalue une expression en se basant sur un context
  try {
    const tokens = tokenizeExpression(expression);
    const ast = parseExpression(tokens);
    return evaluateExpression(ast, context);
  } catch (error) {
    console.error(`Error evaluating expression: "${expression}"`, error);
    return undefined;
  }
}

function tokenizeExpression(expr) {
  // Transforme une expression en tokens basiques (opérateurs, identifiants)
  const tokens = [];
  const regex = /\s*(!|\|\||&&|\(|\)|[a-zA-Z_][a-zA-Z0-9_.]*)\s*/g;
  let match;

  while ((match = regex.exec(expr)) !== null) {
    tokens.push(match[1]);
  }

  return tokens;
}

function parseExpression(tokens) {
  // Construit un AST logique (NOT, AND, OR, etc.) depuis les tokens
  let position = 0;

  function parseOr() {
    let left = parseAnd();

    while (tokens[position] === "||") {
      position++;
      let right = parseAnd();
      left = { type: "OR", left, right };
    }

    return left;
  }

  function parseAnd() {
    let left = parseNot();

    while (tokens[position] === "&&") {
      position++;
      let right = parseNot();
      left = { type: "AND", left, right };
    }

    return left;
  }

  function parseNot() {
    if (tokens[position] === "!") {
      position++;
      let operand = parseNot();

      return { type: "NOT", operand };
    } else {
      return parsePrimary();
    }
  }

  function parsePrimary() {
    const token = tokens[position++];

    if (token === "(") {
      let expr = parseOr();

      if (tokens[position] !== ")") {
        throw new Error("Expected ')'");
      }

      position++;

      return expr;
    } else if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(token)) {
      return { type: "Identifier", name: token };
    } else {
      throw new Error(`Unexpected token: ${token}`);
    }
  }

  const result = parseOr();

  if (position < tokens.length) {
    throw new Error(`Unexpected token: ${tokens[position]}`);
  }

  return result;
}

function evaluateExpression(node, context) {
  // Interprète le noeud de l'AST des expressions
  switch (node.type) {
    case "Identifier":
      return getProperty(context, node.name);
    case "NOT":
      return !evaluateAsBoolean(evaluateExpression(node.operand, context));
    case "AND":
      return (
        evaluateAsBoolean(evaluateExpression(node.left, context)) &&
        evaluateAsBoolean(evaluateExpression(node.right, context))
      );
    case "OR":
      return (
        evaluateAsBoolean(evaluateExpression(node.left, context)) ||
        evaluateAsBoolean(evaluateExpression(node.right, context))
      );
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

function evaluateAsBoolean(value) {
  // Convertit n’importe quelle valeur en booléen
  return Boolean(value);
}

function getProperty(obj, path) {
  // Accède à une propriété d’un objet avec un chemin pointé (ex: user.name)
  return path.split(".").reduce((acc, part) => {
    if (acc && acc.hasOwnProperty(part)) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

function renderAST(ast, context) {
  // Utilise l’AST et le context pour produire la chaîne finale
  let output = "";

  function render(nodes, localContext) {
    for (const node of nodes) {
      switch (node.type) {
        case "TextNode":
          output += node.value;
          break;
        case "ExpressionNode":
          let result = evaluate(node.value, localContext);
          // toute string devient automatiquement SafeHtml
          if (!(result instanceof SafeHtml) && typeof result === "string") {
            result = safeHtml(result);
          }

          if (result instanceof SafeHtml) {
            // HTML déjà sanitizé
            output += result.html;
          } else {
            // autres types (number, boolean…) on cast en string
            output += result !== undefined ? String(result) : "";
          }
          break;
        case "IfNode":
          const conditionValue = evaluate(node.condition, localContext);
          if (evaluateAsBoolean(conditionValue)) {
            render(node.consequent, localContext);
          } else if (node.alternate) {
            render(node.alternate, localContext);
          }
          break;
        case "EachNode":
          // Répète un bloc selon un tableau ou un objet
          const collection = evaluate(node.collection, localContext);

          if (collection && typeof collection === "object") {
            if (Array.isArray(collection)) {
              for (let i = 0; i < collection.length; i++) {
                const tmpContext = { ...localContext };
                if (node.secondVar) {
                  tmpContext[node.firstVar] = i;
                  tmpContext[node.secondVar] = collection[i];
                } else {
                  tmpContext[node.firstVar] = collection[i];
                }
                render(node.body, tmpContext);
              }
            } else {
              for (const k in collection) {
                if (collection.hasOwnProperty(k)) {
                  const tmpContext = { ...localContext };
                  if (node.secondVar) {
                    tmpContext[node.firstVar] = k;
                    tmpContext[node.secondVar] = collection[k];
                  } else {
                    tmpContext[node.firstVar] = k;
                  }
                  render(node.body, tmpContext);
                }
              }
            }
          }
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    }
  }

  render(ast, context);
  return output;
}

// Point d’entrée principal pour utiliser le moteur de template
E.templateEngine2 = (template, context) => {
  const tokens = tokenize(template);
  const ast = parseTokens(tokens);
  return renderAST(ast, context);
};

/*
  transitionend.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var enterClass = "is-transitionEnter";
  var exitClass = "is-transitionExit";

  E.transition = (function () {
    /**
     *
     * @param {HTMLElement} node
     * @param {string} property - propriété CSS à surveiller
     * @param {boolean} enterCondition - condition d'entrée du node
     */
    function addListener(node, property, enterCondition) {
      node.addEventListener("transitionend", function (ev) {
        if (ev.target === node && ev.propertyName === property) {
          if (enterCondition()) {
            node.classList.remove(exitClass);
            node.classList.add(enterClass);
          } else {
            node.classList.remove(enterClass);
            node.classList.add(exitClass);
          }
        }
      });
    }

    function initEnter(node) {
      node.classList.add(enterClass);
    }

    function initExit(node) {
      node.classList.add(exitClass);
    }

    return {
      addListener: addListener,
      initEnter: initEnter,
      initExit: initExit,
    };
  })();
})(window, document, window.E || {});

/*
uid.js

https://github.com/lukeed/uid
*/

(function (window, document, E, undefined) {
  "use strict";

  var IDX = 36;
  var HEX = "";
  var str, num;
  while (IDX--) HEX += IDX.toString(36);

  E.uid = function (len) {
    str = "";
    num = len || 20;
    // eslint-disable-next-line no-bitwise
    while (num--) str += HEX[(Math.random() * 36) | 0];
    return str;
  };
})(window, document, window.E || {});

/*
userData.js
*/

(function (window, document, E, undefined) {
  "use strict";

  const createInstance = () => {
    let currentData = sessionStorage.getItem("CEL_MOM_CURRENT_DATA");

    // non connecté
    if (!currentData) return null;

    currentData = JSON.parse(currentData);

    // ancien sessionStorage pour données courantes
    let celMom = sessionStorage.getItem("CEL_MOM");
    if (celMom) {
      celMom = JSON.parse(celMom);
      currentData = E.extend(true, currentData, celMom);
    }

    // ajout des comptes clients
    let comptesClients = sessionStorage.getItem("CEL_MOM_COMPTESCLIENTS");
    if (comptesClients && currentData.refBP) {
      comptesClients = JSON.parse(comptesClients)[currentData.refBP];

      if (comptesClients && Object.keys(comptesClients).length) {
        currentData.accounts = comptesClients;
      }
    }

    // ajout PDL (pointsDeLivraison)
    if (
      currentData.ccEnSession &&
      currentData.accounts &&
      currentData.accounts[currentData.ccEnSession] &&
      currentData.accounts[currentData.ccEnSession].pointsDeLivraison
    ) {
      currentData.pointsDeLivraison =
        currentData.accounts[currentData.ccEnSession].pointsDeLivraison;
    }

    // ajout des contrats
    let contrats = sessionStorage.getItem("CEL_MOM_CONTRATS");
    if (contrats) {
      currentData.contrats = JSON.parse(contrats);
    }

    return new Object(currentData);
  };

  let instance;

  const userData = (() => {
    return {
      getInstance: () => {
        if (!instance) {
          instance = createInstance();
        }

        return instance;
      },
    };
  })();

  E.userData = userData.getInstance();
})(window, document, window.E || {});

/*
getDeviceInfos.js
*/

(function (window, document, E, undefined) {
  "use strict";

  // NAVIGATEUR-OS
  var guessInfos = {
    header: [
      navigator.platform,
      navigator.userAgent,
      navigator.appVersion,
      navigator.vendor,
      window.opera,
    ],

    dataos: [
      { name: "Windows Phone", value: "Windows Phone" },
      { name: "Windows", value: "Win" },
      { name: "iPhone", value: "iPhone" },
      { name: "iPad", value: "iPad" },
      { name: "Kindle", value: "Silk" },
      { name: "Android", value: "Android" },
      { name: "PlayBook", value: "PlayBook" },
      { name: "BlackBerry", value: "BlackBerry" },
      { name: "macOS", value: "Mac" },
      { name: "Linux", value: "Linux" },
      { name: "Palm", value: "Palm" },
    ],

    databrowser: [
      { name: "Internet Explorer", value: "Trident" },
      { name: "Edge", value: "Edge" },
      { name: "Chrome", value: "Chrome" },
      { name: "Firefox", value: "Firefox" },
      { name: "Safari", value: "Safari" },
      { name: "Opera", value: "Opera" },
      { name: "BlackBerry", value: "CLDC" },
      { name: "Mozilla", value: "Mozilla" },
    ],

    init: function () {
      var agent = this.header.join(" ");

      return {
        os: this.matchItem(agent, this.dataos),
        browser: this.matchItem(agent, this.databrowser),
      };
    },

    matchItem: function (string, datum) {
      var regex, match;

      for (var i = 0; i < datum.length; i++) {
        regex = new RegExp(datum[i].value, "i");
        match = regex.test(string);

        if (match) return datum[i].name;
      }

      return "inconnu";
    },
  };

  var deviceInfos = guessInfos.init();
  // END - NAVIGATEUR-OS

  function eUId() {
    if (!E.storage.getItem("eUId")) E.storage.setItem("eUId", E.uid(), 360);

    return E.storage.getItem("eUId");
  }

  E.device = deviceInfos;
  E.device.uid = eUId();
})(window, document, window.E || {});

(function (window, document, E, undefined) {
  "use strict";

  // Classe Factory - Gère la création et l'initialisation des plugins
  class Factory {
    constructor() {
      // Liste des callbacks pour les plugins prêts
      this.initCallbacks = [];
    }

    /**
     * Configure les paramètres pour un nœud donné
     * @param {HTMLElement} node - L'élément DOM pour lequel les paramètres doivent être définis
     * @returns {Object} - Paramètres combinés par défaut et personnalisés
     */
    setSettings(node) {
      try {
        const attrValue = node.getAttribute(this.attr);
        const customSettings = E.isJson(attrValue) ? JSON.parse(attrValue) : {};
        return E.extend(true, this.defaultSettings, customSettings);
      } catch (error) {
        console.error("Erreur de parsing des settings : ", error);
        return this.defaultSettings;
      }
    }

    /**
     * Crée une instance de plugin pour un nœud spécifique
     * @param {HTMLElement} node - L'élément DOM pour lequel créer une instance de plugin
     * @returns {Object} - Instance créée ou existante
     */
    createInstance(node) {
      // Vérifier si une instance existe déjà pour éviter les doublons
      if (node[this.pluginName]) return;

      const instance = new this.Plugin();
      instance.settings = this.setSettings(node);
      instance.el = node;
      instance.init();

      // Attacher l'instance directement au nœud DOM pour l'accès externe
      node[this.pluginName] = instance;

      return instance;
    }

    /**
     * Crée et enregistre un plugin, puis initialise toutes les instances du DOM
     * @param {string} pluginName - Nom du plugin à créer
     * @param {string} attr - Attribut de données qui identifie les nœuds à traiter
     * @param {Object} defaultSettings - Paramètres par défaut du plugin
     * @param {Function} Plugin - Constructeur du plugin
     */
    createPlugin(pluginName, attr, defaultSettings, Plugin) {
      this.pluginName = pluginName;
      this.attr = attr;
      this.defaultSettings = defaultSettings;
      this.Plugin = Plugin;

      // Enregistrement du plugin dans l'objet global E
      if (!E.plugins[pluginName]) {
        E.plugins[pluginName] = () => {
          this.createPlugin(pluginName, attr, defaultSettings, Plugin);
        };
        E.updaters[pluginName] = E.plugins[pluginName];
      }

      // Initialisation des instances du plugin dans le DOM
      if (attr) {
        const nodes = document.querySelectorAll(`[${attr}]`);
        nodes.forEach((node) => this.createInstance(node));
      }

      // Exécution des callbacks quand le plugin est prêt
      this.initCallbacks.forEach((item) => {
        if (item.pluginName === pluginName && !item.done) {
          item.cb();
          item.done = true;
        }
      });
    }

    /**
     * Enregistre un callback qui sera exécuté une fois le plugin prêt
     * @param {string} pluginName - Nom du plugin
     * @param {Function} cb - Callback à exécuter
     */
    whenReady(pluginName, cb) {
      if (
        E.plugins[pluginName] &&
        this.areAllInstancesInitialized(pluginName)
      ) {
        cb();
      } else {
        this.initCallbacks.push({ pluginName, cb, done: false });
      }
    }

    /**
     * Vérifie si toutes les instances d'un plugin spécifique ont été initialisées
     * @param {string} pluginName - Nom du plugin
     * @returns {boolean} - Retourne true si toutes les instances sont prêtes
     */
    areAllInstancesInitialized(pluginName) {
      const nodes = document.querySelectorAll(`[data-${pluginName}]`);
      return Array.from(nodes).every((node) => node[pluginName]);
    }
  }

  // Instanciation de la classe Factory et attachement à l'objet global E
  E.factory = new Factory();
})(window, document, window.E || {});

(function (window, document, E, undefined) {
  "use strict";

  // activate debug mode
  E.debug = document.documentElement.hasAttribute("data-debug");

  var abInterchangeSettings = {
    lazy: false,
    lazySettings: {
      offscreen: 1.2,
      delayed: 15000,
    },
  };

  // init AB-mediaQuery: https://github.com/lordfpx/AB-mediaQuery
  if (typeof abMediaQuery !== "undefined") {
    abMediaQuery({
      smallOnly: "screen and (max-width: 47.99em)",
      small: "screen and (min-width: 0em)",
      mediumOnly: "screen and (min-width: 48em) and (max-width: 64em)",
      smallMediumDown: "screen and (max-width: 63.99em)",
      medium: "screen and (min-width: 48em)",
      bigMediumUp: "screen and (min-width: 64em)",
      largeOnly: "screen and (min-width: 64.01em) and (max-width: 80em)",
      large: "screen and (min-width: 64.01em)",
      hugeOnly: "screen and (min-width: 80.01em) and (max-width: 120em)",
      huge: "screen and (min-width: 80.01em)",
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // init AB-interchange: https://github.com/lordfpx/AB-interchange
    if (typeof abInterchange !== "undefined") {
      if (document.body.hasAttribute("data-e-interchange-settings")) {
        abInterchangeSettings = JSON.parse(
          document.body.getAttribute("data-e-interchange-settings")
        );
      }
      abInterchange(abInterchangeSettings);
      E.updaters.abInterchange = function () {
        abInterchange(abInterchangeSettings);
      };
    }

    // init des faux boutons
    E.fakeBtn();

    // Ajout d'attribut pour a11y sur la font icon .icon
    const iconNodes = document.querySelectorAll(".icon:not([aria-hidden])");
    iconNodes.forEach((icon) => icon.setAttribute("aria-hidden", "true"));
  });
})(window, document, window.E || {});
