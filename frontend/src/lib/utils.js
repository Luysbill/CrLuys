import * as React from "react";

export function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
}
