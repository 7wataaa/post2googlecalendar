import { Action, ActionPanel, Form, getPreferenceValues, open, showToast, Toast } from "@raycast/api";
import axios from "axios";
import { calendar_v3 } from "googleapis";
import { useEffect } from "react";
import { authorize, client } from "../auth";
import { useRaycastFormClear } from "../hooks/useRaycastFormClear";

/**
  Events: quickAdd
  {@Link https://developers.google.com/calendar/api/v3/reference/events/quickAdd}
 */
export type QuickAddParams = {
  text: string;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
};

export const insertEventToGoogleCalendar = async (calendarId: string, params: QuickAddParams) => {
  await authorize();

  const quickAddURL = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/quickAdd`;

  const res = await axios
    .post<calendar_v3.Schema$Event>(quickAddURL, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
    })
    .catch(() => {
      return null;
    });

  return res;
};

export type QuickFieldValues = {
  quickAddField: string;
};

export const QuickAddPage = () => {
  const [quickAddFieldProp, clearQuickAddField] = useRaycastFormClear();

  const calendarID = getPreferenceValues()["calendarID"];

  useEffect(() => {
    authorize();
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit"
            onSubmit={async (values: QuickFieldValues) => {
              clearQuickAddField();

              showToast({
                style: Toast.Style.Animated,
                title: "Adding schedule...",
              });

              const res = await insertEventToGoogleCalendar(calendarID, {
                text: values.quickAddField,
              });

              if (!res) {
                showToast({
                  style: Toast.Style.Failure,
                  title: "Error",
                  message: "Probably wrong calendar ID.",
                });
              } else if (res.status === 200) {
                showToast({
                  style: Toast.Style.Success,
                  title: "Addition complete.",
                  primaryAction: {
                    title: "Open in Browser",
                    shortcut: { key: "g", modifiers: ["cmd"] },
                    onAction: () => open(res.data?.htmlLink ?? ""),
                  },
                });
              } else {
                showToast({
                  style: Toast.Style.Failure,
                  title: `Error (${res.status})`,
                });
                console.error(res);
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="quickAddField"
        title="QuickAdd"
        placeholder="e.g., Meeting with X next tuesday at 3pm"
        autoFocus
        {...quickAddFieldProp}
      />
      <Form.Separator />
    </Form>
  );
};
