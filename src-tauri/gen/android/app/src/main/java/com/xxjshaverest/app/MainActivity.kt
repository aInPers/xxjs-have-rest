package com.xxjshaverest.app

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  private var webView: WebView? = null
  private var backCallback: OnBackPressedCallback? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    this.webView = webView
    super.onWebViewCreate(webView)
  }

  override fun onResume() {
    super.onResume()
    // The Activity can be recreated when Android switches navigation modes.
    backCallback?.remove()
    backCallback = object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val currentWebView = webView
        if (currentWebView == null) {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
          isEnabled = true
          return
        }
        currentWebView.evaluateJavascript("window.dispatchEvent(new Event('android-back'))", null)
      }
    }
    onBackPressedDispatcher.addCallback(this, backCallback!!)
  }
}
