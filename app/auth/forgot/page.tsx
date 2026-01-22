"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {AuthLayout, FormInputField, HIGHLIGHT} from "@/components/auth/auth-components";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { handleForgotPassword } from "@/lib/auth/actions";
import { signinRoute } from "@/lib/constants";

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
});

function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: { email: string }) => {
        setIsLoading(true);
        form.clearErrors();

        const { error, success } = await handleForgotPassword(values.email);

        if (error) {
            // Signal error via Form UI and Toast
            form.setError("root", { message: error });
            toast.error("Request Failed", {
                description: error,
            });
        } else {
            // Signal success and redirect
            toast.success("Reset link sent, check your email !");
            router.push(signinRoute);
        }

        setIsLoading(false);
    };

    return (
        <AuthLayout
            quoteOverride={{
                id: 99,
                text: ["Even World Champions need a ", <span key="fp1-1" className={HIGHLIGHT}>pit stop</span>]
            }}
            tipOverride={"No need to panic. We’ve seen this before. We’ll have the engine fired up in no time."}
            formPosition={"left"}
        >
            <header className="mb-8 space-y-2 font-archivo">
                <h1 className="text-3xl font-semibold tracking-tight">Forgot Password</h1>
                <p className="text-muted-foreground text-sm">
                    We&#39;ll email you a reset link.
                </p>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormInputField
                        control={form.control}
                        name="email"
                        label="Email"
                        placeholder="me@example.com"
                    />

                    {form.formState.errors.root && (
                        <p className="text-sm text-destructive font-medium">
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        variant="accent"
                        className="w-full h-11 text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            </Form>
        </AuthLayout>
    );
}

export default ForgotPasswordPage;